/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

class Game {
	constructor(showSingles = true, showAllowed = true) {
		this.canvas = $("#canvas").get(0);
		this.board = new Board(9);
		this.selRow = 0;
		this.selCol = 0;
		this.selRowBef = 0;
		this.selColBef = 0;
		this.stack = new Array();

		this.showSingles = showSingles; // print singles in red
		this.showAllowed = showAllowed; // print the mask in each cell
	}

	/* UI methods */

	drawGrid() { //use canvas to draw the sudoku grid
		let drawPath = function (i) {
			let val = i * 60 + 0.5;
			con.beginPath();
			con.lineWidth = (i % 3) ? 1 : 3;
			//verticals lines
			con.moveTo(val, 0.5);
			con.lineTo(val, dim);
			//horizontal lines
			con.moveTo(0.5, val);
			con.lineTo(dim, val);
			con.stroke();
		}
		let con = this.canvas.getContext('2d');
		con.strokeStyle = '#808080';

		let dim = 540.5; // dim = 9(boardSize) * 60(cellSize) + 0.5(space) 

		Array.from({ length: 10 }).forEach((e, i) => drawPath(i));
	}

	drawSingleCell(con, loc, selVal) { // draw a cell based on location
		let cel = this.board.getCell(loc);

		if (this.showAllowed && cel.isNotAssigned()) { //Draw allowed
			con.font = "12pt Calibri";
			cel.mask.valuesArray().forEach(val => {//Show all possible values that can be in that cell
				let subCol = (loc.col + 0.5) * 60 + (Math.floor((val - 1) % 3) - 1) * 18;
				let subRow = (loc.row + 0.5) * 60 + (Math.floor((val - 1) / 3) - 1) * 18;

				if (this.showSingles && cel.mask.count == 1) con.fillStyle = "#ff143c"; //print the single in red
				else con.fillStyle = "#aaaaaa";

				con.fillText(val, subCol, subRow);
			});
		} else if (cel.isAssigned()) { // draw values
			let value = cel.getValue();
			con.font = "32pt Calibri";
			let subCol = (loc.col + 0.5) * 60;
			let subRow = (loc.row + 0.5) * 60;

			if (!!selVal && value == selVal) {// same number than selected row-col
				con.fillStyle = "#F91919";
			} else {
				con.fillStyle = cel.isGiven() ? "#2200aa" : "#696969";
			}
			con.fillText(cel.getValue(), subCol, subRow);
		}
	}

	drawCells() {// updates every cell with the value or the mask
		let con = this.canvas.getContext('2d');
		con.textAlign = "center";
		con.textBaseline = "middle";

		//print selected
		con.beginPath();
		con.rect(this.selCol * 60 + 2.5, this.selRow * 60 + 2.5, 56, 56);
		con.fillStyle = "#A9F5E1";
		con.fill();

		let selValue = this.board.getCell(new Location(this.selRow, this.selCol)).getValue();
		this.board.locs.forEach(loc => this.drawSingleCell(con, loc, selValue));
	}

	updateCanvas() {
		this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawGrid();
		this.drawCells();
	}

	//--------------------------------------------------------------------------------------------
	/* stack methods */

	undo() {
		if (this.stack.length > 1) {
			this.stack.pop();
			this.board = new Board();
			this.board.setString(this.stack[0],true);
			this.board.setString(this.stack[this.stack.length-1],false,true);
			this.updateCanvas();
		}
	}

	pushBoard() {
		if (!this.beforeValEquals())
			this.stack.push(this.board.stringAct.slice(0));
	}

	//--------------------------------------------------------------------------------------------

	selectCell(row, col) {
		this.updateBefore()
		this.selRow = row;
		this.selCol = col;
		this.updateCanvas();
	}

	beforeValEquals() {
		return this.selColBef == this.selCol && this.selRowBef == this.selRow
	}

	updateBefore() {
		this.selColBef = this.selCol;
		this.selRowBef = this.selRow;
	}

	moveSelection(row, col) {
		this.updateBefore();
		let sRow = row + this.selRow;
		let sCol = col + this.selCol;
		this.selRow = (sRow < 0) ? 8 : (sRow > 8) ? 0 : sRow;
		this.selCol = (sCol < 0) ? 8 : (sCol > 8) ? 0 : sCol;
		this.updateCanvas();
	}

	setDigitInCell(digit) {
		var loc = new Location(this.selRow, this.selCol)
		var cel = this.board.getCell(loc);
		if (cel.isGiven())
			return "";
		if (!!digit && cel.isNotAllowed(digit)) {
			return "Not Allowed Value";
		}
		let msg = "{Row: " + this.selRow + " ,Col: " + this.selCol + "} = " + digit;
		
		if (!!cel.getValue()) {
			cel.setValue(0, loc);
		}
		cel.setValue(digit, loc);
		this.pushBoard();
		this.updateCanvas();
		return msg;
	}

	/* GAME METHODS*/
	clearGame() {
		this.stack = new Array();
		this.board.clear();
		this.updateCanvas();
	}

	hint() { // codigo basura
		solution = board.clone();
		if (solution.trySolve(Location.empty, 0)) {
			var cel = solution.getCell(new Location(selRow, selCol));
			if (!cel.isGiven())
				setDigitInCell(cel.getValue());
		}
	}

	reset() {
		this.stack = new Array();
		this.board.reset();
		this.updateCanvas();
	}

	clear() {
		this.board = new Board();
	}

	solve() {
		let startTime = new Date().getTime();
		this.pushBoard();
		let totalTime
		if (this.board.trySolve()) {
			totalTime = ((new Date()).getTime() - startTime) / 1000
		} else {
			totalTime = -1;
		}
		this.updateCanvas();
		return totalTime;
	}
	/*
	acceptPossibles(){
		check()
		acceptPossibles
		[]		
	}*/

	update(target, type) {
		this.board.updateDigits(target, type);
	}
}