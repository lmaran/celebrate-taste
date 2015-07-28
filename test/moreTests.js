'use strict'

var chai=require('chai'),
	expect=chai.expect;
	
chai.should();

function isTrue(num){
	return num % 2 === 0;
}

describe('some other tests', function(){
	it('should be true', function(){
		expect(true).to.be.true;
	});
})