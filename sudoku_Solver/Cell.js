const {Location} = require('./Location')
const {BitSet} = require('./BitSet')
class Cell{
	
	constructor(value = 0){
		this.value = value;
		this.mask = new BitSet(0);
		this.trueMask = new BitSet(0);
		this.answer = 0;
		this.given = false;
		this.loc=new Location(-1,-1);
	}
	
	
	// BOOLEAN METHODS
	
	isGiven(){//returns the given state of this particular cell, it is true if it was a number that was set by the program (hints).
		return this.given;
	}	
	
	isNotAssigned () {//returns true if value is not 0.
		return !this.value;
	}
	
	isAssigned(){
		return !!this.value;
	}
	
	getSingle(){//returns the value of the single possible value given a not assigned cell, returns 0 if there is no single.
		return this.mask.getSingle();
	}
	
	isNotAllowed(n){//returns true if a given number is not allowed in this particular cell, cheking if the BitSet(mask) contains the given number.
		return this.mask.isNotAllowed(n);
	}
	
	equals(c){
		return this.loc.equals(c.loc)
	}
	
	// GET METHODS
	
	getValue(){
		return this.value;
	}
	
	getSiblings(){
		return this.siblings;
	}
	
	getAnswer(){
		return this.answer;
	}
	
	
	hasAnswer() {
		return this.answer != 0;
	}
	getMask(){
		return this.mask;
	}
	
	// SET METHODS
	
	setLoc(loc){
		this.loc=loc;
		return this;
	}
	
	setIndex(i){
		this.index=i;
		return this;
	}
	
	setAnswer(n){
		this.answer = n
		return this
	}
		
	setValue(n){
		if(n != 0 && this.isNotAllowed(n)){
			return false
		}
		
		if(n){
			this.value=n
			this.updateSiblings()
		}
		else
			this.updateSiblings(true)
		this.value=n;
		return true;
	}
	
	setGiven(n){
		this.value = n;
		this.given = !!n;
		if(n)
			return true;
		return false;
	}
		
	// CELL METHODS
	
	reset(){
		this.setValue(0);
		this.answer=0;
		return this;
	}
	
	
	updateMask(n, given, loc){
		if(!this.given){
			this.mask.or(n, loc)
			if(given)
				this.trueMask.or(n, loc);
		}
		return this;
	}
	updateMaskNot(n, loc){
		this.mask.updateMaskNot(n,this.trueMask, loc);
	}
	
	// SIBS METHODS
	
	updateSiblings(type=false){
		if(this)
			global.board.updateDigits(this,type);
	}
	
	update(target,type){
		if(!this.given)
			if(type)
				this.updateMaskNot(1 << target.getValue(), target.loc)
			else
				this.updateMask(1 << target.getValue(), target.isGiven(), target.loc)
		return this;
	}
	
	
}

module.exports = {
	Cell
}