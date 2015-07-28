'use strict'

var chai=require('chai'),
	expect=chai.expect;
	
chai.should();

function isEven(num){
	return num % 2 === 0;
}

describe('isEven', function(){
	it('should return true when number is even', function(){
		isEven(4).should.be.true;
	});
	
	it('should return false when the number is odd', function(){
		expect(isEven(5)).to.be.false;
	});
})

function add(num1, num2){
	return num1 + num2;
}

describe('add function',function(){
	var num;
	beforeEach(function(){
		num = 5;
	});
	
	it('should be 10 when adding 5 to 5', function(){
		add(num, 5).should.equal(10);
	});
	
	xit('should be 12 when adding 7 to 5', function(){
		add(num, 7).should.equal(12);
	});
})