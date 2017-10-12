/*
  @author Denis Rodriguez Viquez
          Luis Vasquez Quiros
          Walter Chavez Oviedo
          Manuel Masis Segura
  @since 2017
*/

class BitSet {
	constructor(n = 0){
		this.mask = 1 << n;
		this.count = 9;
		this.backup = new Map();
	}
	
	// BOOLEAN METHODS
	
	isAllowed(n){
		return !!(~this.mask & (1 << n));
	}
	
	isNotAllowed(n){
		return !!(this.mask & (1 << n));
	}
	
	// BITMASK METHODS
	
	or(n, loc){
		if(this.backup.get(n)&&this.backup.get(n).size){
			if(this.backup.get(n).size<3)
				this.backup.get(n).add(loc);
		}
		else{
			this.backup.set(n, new Set())
			this.backup.get(n).add(loc);
			this.mask |= n;
			this.count=9-this.backup.size;
		}
		this.hasSingle=this.backup.size==8
	}
		
	updateMaskNot(n,trueMask,loc){
		if(this.backup.get(n)&&!(trueMask.mask & n)&&n!=0){
			if(this.backup.get(n).size==1){
				this.backup.delete(n);
				this.mask = (~((~this.mask)|n))
				this.count=9-this.backup.size;
			}
			else
				this.backup.get(n).delete(loc);
			this.hasSingle=this.backup.size==8
		}
	}
	
	// VALUES METHODS
	
	getSingle(){
		let loop = i => (i < 10) ? (~this.mask & (1 << i)) ? i 
														   : loop(i+1) 
								 : 0;
		return loop(1);
	}
	
	valuesArray(){
		return Array.from({length:9}).reduce((z,e,i) => ((1 << i+1) & ~this.mask)? z.concat(i+1) : z, [])
	}	
	
}