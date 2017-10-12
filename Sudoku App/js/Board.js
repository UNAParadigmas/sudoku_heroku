/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

class Board{
	
	constructor(size = 9) {
		this.size=size;
		this.digits = new Grid(size);
		this.locs = this.createLocs();
		this.check = new Set();
		this.isSolved = this.isValid = false;
		this.minLoc = new Cell();
		this.stringInit = '';
		this.stringAct = '';
		this.singles = []
		this.stack = [];
	}
	
	createLocs() {		
		let _locs = Array.from({length:81},(e,i) => new Location(i % 9, Math.floor(i / 9)));
		_locs.forEach(loc => loc.sibs = loc.getSibsAll())
		_locs.forEach(loc => (this.digits.get(loc).setLoc(loc)));
		return _locs;
	}
	
	updateDigits(target,type){
		if(!type){
			target.loc.getAllSibs().forEach(e=>this.updateMin(this.digits.get(e).update(target,type)))
			if(!target.given)
				this.stringAct=this.stringAct.substr(0,target.loc.index)+target.value+this.stringAct.substr(target.loc.index+1);
		}
		else{
			target.loc.getAllSibs().forEach(e=>this.digits.get(e).update(target,type))
			this.stringAct=this.stringAct.substr(0,target.loc.index)+'.'+this.stringAct.substr(target.loc.index+1);
		}
	}
	
	updateMin(target){
		if(target.isNotAssigned()&&((this.minLoc.mask.count>=target.mask.count)||this.minLoc.isAssigned())){
			this.minLoc=target;
			this.check.add(target);
		}
	}
	
	findCellWithFewestChoices(){
		this.locs.forEach(e=>this.updateMin(this.getCell(e)));
	}
	// GET METHODS
	
	getCell(loc) {
		return this.digits.get(loc);
	}
	
	getMask(loc){
		return this.getCell(loc).getMask();
	}
	
	// SET METHODS
	
	setCell(loc, value) {
		this.getCell(loc) = value;
	}
	
	setString (value, init=false, undo=false) { 
		
		let loc = i => new Location(Math.floor(i/9),i%9);
		let check =(val) => isNaN(val)? 0 : parseInt(val);
		if(undo){
			value = Array.from(this.stringInit).reduce((z,e,i)=>e==value[i]?z+'.':z+value[i],'');
			Array.from(value).forEach((e, i) => check(e)?this.getCell(loc(i)).setValue(parseInt(e)):undefined);
		}
		else if(!init){
			value = Array.from(this.stringAct).reduce((z,e,i)=>e==value[i]?z+'.':z+e,'');
			Array.from(value).forEach((e, i) => check(e)?this.getCell(loc(i)).reset():undefined)
		} /*if(init && undo){
			value = Array.from(this.stringInit).reduce((z,e,i)=>e==value[i]?z+'.':z+value[i],'');
			Array.from(value).forEach((e, i) => check(e)?this.getCell(loc(i)).setValue(0):undefined);
		}*/
		else{
			let changes = Array.from(value).reduce((z, val, i) => this.getCell(loc(i)).setGiven(check(val), loc(i))?z.concat(loc(i)):z,[])
			changes.forEach(e=>this.digits.get(e).updateSiblings())
			this.stringInit = value;
			this.stringAct = value;
		}
	}
	
	// ANSWER METHODS
	acceptPossibles(){
		return !this.singles.filter(cell => !cell.setValue(cell.getAnswer())).length;
	}
	
	trySolve(){
		this.singles = [];
		if(this.check.size){
			let vec=this.detSolve()
			if(vec[vec.length-1]==false){
				return false;
			}
		}
		if(this.checkSolved()) return true;
		if(!this.isSolved){//non deteministic case
			this.stack.push(this.minLoc);
			this.stack.push(this.stringAct.slice(0));
			return this.nonDetSolve(this.minLoc.mask.valuesArray(),0);
		}
		return true;
	}
	
	detSolve(vec = []){
		if(this.analyzeGrid()){
			if(!this.acceptPossibles())
				return vec.concat(this.singles.concat(false));
			return this.detSolve(vec.concat(this.singles));
		}
		return vec;
	}
	
	nonDetSolve(arr, i){
		if(arr.length==i){
			this.rollback();
			return false;
		}
		this.minLoc.setValue(arr[i])
		if(!this.trySolve()){
			this.rollback(true)
			return this.nonDetSolve(arr, i+1);
		}
		return true;
	}
	
	rollback(type = false){
		if(type)
			this.rollbackIter()
		else
			this.rollbackStack()
	}
	
	rollbackStack(){
		if(this.stack.length>4){
			this.setString(this.stack.pop());
			this.minLoc=this.stack.pop();
			this.minLoc.reset();
			this.setString(this.stack[this.stack.length-1])
			this.minLoc=this.stack[this.stack.length-2];
		}
		else{
			this.setString(this.stack.pop());
			this.minLoc=this.stack.pop();
			this.minLoc.reset();
		}
	}
	
	rollbackIter(){
		if(this.stack.length){
			this.setString(this.stack[this.stack.length-1]);
			this.minLoc=this.stack[this.stack.length-2];
		}
	}
	
	analyzeGrid(){
		this.singles = [];
		Array.from(this.check).forEach(cell => this.chechForSingleAnswer(cell));
		this.check=new Set();
		if(!this.singles.length) return false;
		return true;
	}
	chechForSingleAnswer(cell){
		if(cell.mask.hasSingle&&cell.isNotAssigned()&&!cell.isGiven()){
			cell.setAnswer(cell.getSingle());
			this.singles.push(cell);
			return true;
		}
		return false;
	}
	
	checkSolved(){		
		if(this.minLoc.mask.count>2||this.minLoc.isAssigned())
			this.findCellWithFewestChoices();
		if(this.minLoc.isAssigned()){
			this.isSolved=true
			return true
		}
	}
	//USER METHODS
	
	findSingles(){
		let checkCell = (z,cell) => (cell.isNotAssigned() && cell.mask.count == 1)? z.concat(cell.setAnswer(cell.mask.getSingle())) : z;
		this.locs.reduce((z,loc) => checkCell(z,this.getCell(loc)),[]).forEach(cell => cell.setValue(cell.getAnswer()));
	}
	
	findAloneSingle(){
		let checkCell = (z,cell) => (cell.isNotAssigned() && cell.mask.count == 1)? z.concat(cell) : z;
		let vec = this.locs.reduce((z,loc) => checkCell(z,this.getCell(loc)),[]);
		if(vec.length > 0){
			vec[0].setValue(vec[0].mask.getSingle());
		} 		
	}
	
	
	// GAME METHODS
	
	
	reset() {
		this.isSolved  = false;
		let check = (cell) => cell.isGiven()? cell : cell.reset(0);
		this.locs.forEach(loc => check(this.getCell(loc)));
	}
	
	checkIsValidSibs (digit, locs) {
		return checkGeneral(x=>this.getCell(x).getAnswer()==digit, locs) != 0;
	}
	
	checkGeneral(f, locs){
		return locs.reduce((z,elem)=>f(elem)?z+1:z);
	}
}


