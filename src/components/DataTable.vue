<template>
		<form class="table-header" @submit="onNewRecordAdd">
				<label style="grid-area: label1" for="name">Name:</label>
				<input style="grid-area: input1" type="text" id="name" name="name" v-model="name" />
		
				<label style="grid-area: label2" for="netto">Netto:</label>
				<span style="grid-area: dlr1">$</span>
				<input style="grid-area: input2" type="number" id="netto" name="netto" />
		
				<label style="grid-area: label3;" for="brutto">Brutto:</label>
				<span style="grid-area: dlr2">$</span>
				<input style="grid-area: input3" type="number" id="brutto" name="brutto" />
		
				<label style="grid-area: label4" for="quantity">Quantity:</label>
				<input style="grid-area: input4" type="number" id="quantity" name="quantity" />
	
				<input style="grid-area: submit" class='btn btn-success m-3' type="submit" value="Add" />
		
				<div style="grid-area: error" class="m-0">{{ errMsg }}</div>

				<button style="grid-area: button1" class="btn btn-primary m-3 p-2" @click="fetchData">Get Data</button>
				<button style="grid-area: button2" class="btn btn-primary m-3 p-2" @click="toggleTable">{{ this.dataShow ? 'Hide table' : 'Show table'}}</button>
		</form>


	<table class="table" v-if="this.dataShow">
		<tr class="table_row">
			<th style="width: 10%" class="table_header">id</th>
			<th style="width: 15%" class="table_header">name</th>
			<th style="width: 15%" class="table_header">netto</th>
			<th style="width: 15%" class="table_header">brutto</th>
			<th style="width: 15%" class="table_header">quantity</th>
			<th style="width: 30%" class="table_header">remove</th>
		</tr>
		<template v-for="(datum, index) in data" v-bind:key="index">
			<tr class="table_row" v-if="(index >= (perPage*(page-1))) && (index <= perPage*page-1) && datum != undefined">
				<td class="table_cell">{{datum.id}}</td>
				<td class="table_cell">{{datum.name}}</td>
				<td class="table_cell">{{datum.netto}}</td>
				<td class="table_cell">{{datum.brutto}}</td>
				<td class="table_cell">{{datum.quantity}}</td>
				<td class="table_cell">
					<div class="remove-record-form">
						<div class="cancel-button" @click="onRecordPreremove(index)"><i class="fa-solid fa-xmark" ></i></div>
						<button :class="{hidden: deleteConfirm[index]}" class="btn btn-danger" @click="onRecordRemove(index)">Confirm</button>
					</div>
				</td>
			</tr>
		</template>
	</table>

	<div class="table-navigation" v-if="this.dataShow">
		<div class="table-navigation-sort">
			<label for='sort'>sort by</label>
			<select name="sort" id="sort" v-model="sortProp" @change="onFormChange($event)">
				<option value="id">id</option>
				<option value="name">name</option>
				<option value="netto">netto</option>
				<option value="brutto">brutto</option>
				<option value="quantity">quantity</option>
			</select>
			<select name="sortDir" id="sortDir" v-model="sortDirProp" @change="onFormChange($event)">
				<option value="asc">ascending</option>
				<option value="desc">descending</option>
			</select>
		</div>
	
		<div class="table-navigation-currentpage">
			Current page: 
			<button @click="changePage(1)" :disabled="!isLeftPagOn">&lt;</button>
			{{ page }}
			<button @click="changePage(-1)" :disabled="!isRightPagOn">&gt;</button>
		</div>
	</div>
</template>

<script>
	import axios from 'axios'
	import { getDatabase, set, ref, onValue } from 'firebase/database'

	export default {
		name: "DataTable",
		data() {
			return {
				data: [],
				page: 1,
				perPage: 25,
				isLeftPagOn: false,
				isRightPagOn: false,
				errMsg: '',
				sortProp: 'id',
				sortDirProp: 'asc',
				name: '',
				deleteConfirm: [],
				dataShow: false,
			}
		},
		created() {
			onValue(ref(getDatabase(), '/data'), (snapshot) => {
				this.data = snapshot.val()
				this.data.map((datum, index) => this.deleteConfirm[index] = true)
			})
		},
		methods: {
			fetchData: function () {
				axios.get('http://localhost:3000/data').then(res => {
					this.data = res.data
					this.disablePags()
					this.sortData()
				}).catch(err => {
					console.error(err)
				})
			},
			sortData: function() {
				const sort_by = this.sortProp
				const sort_dir = this.sortDirProp
				
				if(sort_dir === 'asc') {
					this.data = this.data.sort((a,b) => {
						if(a[sort_by] > b[sort_by]) {
							return 1
						} else if(a[sort_by] < b[sort_by]) {
							return -1
						} else return 0
					})
				} else if(sort_dir === 'desc') {
					this.data = this.data.sort((a,b) => {
						if(a[sort_by] < b[sort_by]) {
							return 1
						} else if(a[sort_by] > b[sort_by]) {
							return -1
						} else return 0
					})
				}

				const filtered = this.data.filter(datum => datum != undefined)
				this.data = filtered
				this.data.map((datum, index) => this.deleteConfirm[index] = true)
				this.disablePags()

				// write to database
				console.log('updating database with', this.data)
				set(ref(getDatabase(), 'data/'), this.data)
			},
			changePage: function (value) {
				this.page -= value
				this.disablePags()
			},
			disablePags() {
				if(this.page ==  1) this.isLeftPagOn = false
				else this.isLeftPagOn = true

				if(this.page >= this.data.length / this.perPage) this.isRightPagOn = false
				else this.isRightPagOn = true
			},
			onNewRecordAdd: function (e) {
				const name = e.target.name.value
				const brutto = e.target.brutto.value
				const netto = e.target.netto.value
				const quantity = e.target.quantity.value

				this.errMsg = ''

				if(
					name === "" ||
					brutto === "" ||
					netto === "" ||
					quantity === ""
				) {
					this.errMsg = 'Values can\'t be empty!'
				}

				if(
					brutto < 0 ||
					netto < 0 ||
					quantity < 0
				) {
					this.errMsg = 'Values can\'t be negative!'
				}

				if(this.errMsg === '') {
					const updatedData = this.data
					Object.assign(updatedData, {[this.data.length]: {
						id: this.data.length + 1,
						name,
						brutto,
						netto,
						quantity,
					}})
				}

				this.disablePags()
				this.sortData()

				e.preventDefault()
			},
			onRecordRemove(index) {
				const updatedData = this.data
				delete updatedData[index]
				this.data = updatedData
				this.sortData()

				index.preventDefault()
			},
			onFormChange() {
				this.sortData()
      },
			onRecordPreremove(index) {
				this.deleteConfirm[index] = !this.deleteConfirm[index];
			},
			toggleTable() {
				this.dataShow = !this.dataShow
			}
		}	
	}
</script>

<style scoped>
	.table {
		margin: 0 auto;
		width: 40%;
		border-collapse: 	collapse;
	}

	tr:nth-child(odd) {
		background-color: #eee
	}

	.table-navigation {
		display: flex;
		width: 40%;
		margin: 0 auto;
		padding: 1rem 0;
		justify-content: space-around;
	}

	.table-navigation-sort > * {
		margin: 0.2rem;
	}

	.table-header {
		display: grid;
		grid-template-rows: repeat(8, 2rem) 4rem 2rem;
		grid-template-columns: 1.5rem 1fr 6rem;
		grid-template-areas: 
			".    label1 button1"
			".    input1 button1"
			".    label2 button1"
			"dlr1 input2 button1"
			".    label3 button2"
			"dlr2 input3 button2"
			".    label4 button2"
			".    input4 button2"
			"submit submit submit"
			"error error error";
		margin: 0 auto;
		width: 25%;
	}

	.table-header form {
		display: block;
		width: auto;

		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.get-data {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.get-data button {
		height: 40%;
	} 

	.cancel-button {
		border-radius: 50%;
		padding: 0.5rem 0.5rem;
		text-align: center;
	}

	.cancel-button:hover {
		background-color: #ccc;
	}

	.remove-record-form {
		display: flex;
		flex-direction: row;

	}

	.remove-record-form div {
		padding: 0.5rem;
	}

	.remove-record-form > * {
		margin: 0rem 0.5rem;
	}

	.hidden {
		display: none !important;
	}
</style>