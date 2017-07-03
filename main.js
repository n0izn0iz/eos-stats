const Web3 = require("web3")
const url = require("./provider.json").url
const web3Provider = new Web3.providers.HttpProvider(url)

const BigNumber = require("bignumber.js")
const one = new BigNumber(1)
const web3 = new Web3(web3Provider)

const TruffleContract = require("truffle-contract")
const abi = require("./contractAbi.json")
var Contract = TruffleContract({abi: abi})
Contract.setProvider(web3Provider)

const address = "0xd0a6e6c54dbc68db5db3a091b171a77407ff7ccf"

function totalCreated(createFirstDay, today, createPerDay) {
	return (createFirstDay.plus(createPerDay.times(today.minus(1))))
}

Contract.at(address).then((contract) => {
	var contractState = {}
	contract.createFirstDay.call(
	).then((createFirstDay) => {
		contractState.createFirstDay = createFirstDay
		return (contract.numberOfDays.call())
	}).then((numberOfDays) => {
		contractState.numberOfDays = numberOfDays
		return (contract.createPerDay.call())
	}).then((createPerDay) => {
		contractState.createPerDay = createPerDay
		return (contract.today.call())
	}).then((today) => {
		contractState.today = today
		return (contract.dailyTotals.call(today))
	}).then((todayTotal) => {
		contractState.todayTotal = todayTotal
		return (web3.eth.getBalance(address))
	}).then((balance) => {
		contractState.balance = balance
		contractState.totalPayed = balance.minus(contractState.todayTotal)
		contractState.totalCreated = totalCreated(contractState.createFirstDay
					, contractState.today, contractState.createPerDay)
		contractState.establishedPrice =
			contractState.totalPayed.dividedBy(contractState.totalCreated)
		contractState.currentPrice = contractState.todayTotal.dividedBy(contractState.createPerDay)
		console.log(
			"Established price: " +
			web3.fromWei(contractState.establishedPrice.times(1000000000000000000), 'finney') +
			" finey for 1 EOS"
		)
		console.log(
			"Established price: " +
			one.dividedBy(web3.fromWei(contractState.establishedPrice.times(1000000000000000000), 'ether')) +
			" EOS for 1 ETH"
		)
		console.log(
			"Current distribution price: " +
			web3.fromWei(contractState.currentPrice.times(1000000000000000000), 'finney') +
			" finney for 1 EOS"
		)
		console.log(
			"Current distribution price: " +
			one.dividedBy(web3.fromWei(contractState.currentPrice.times(1000000000000000000), 'ether')) +
			" EOS for 1 ETH"
		)
	})
})
