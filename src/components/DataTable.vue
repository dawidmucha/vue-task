<template>
  <button @click="fetchData">Get Data</button>

	<form @submit="sortData">
		<label for='sort'>sort by</label>
		<select name="sort" id="sort">
			<option value="id">id</option>
			<option value="name">name</option>
			<option value="netto">netto</option>
			<option value="brutto">brutto</option>
			<option value="quantity">quantity</option>
		</select>
		<select name="sort_dir" id="sort_dir">
			<option value="asc">ascending</option>
			<option value="desc">descending</option>
		</select>
		<button type="submit">sort</button>
	</form>


	<div>
		Current page: 
		<button @click="addPage(1)" :disabled="isLeftPagDisabled">&lt;&lt;</button>
		{{ page }}
		<button @click="addPage(-1)" :disabled="isRightPagDisabled">&gt;&gt;</button>
	</div>

	<form @submit="onNewRecordAdd">
		<label for="name">Name:</label>
		<input type="text" id="name" name="name" />

		<label for="netto">Netto:</label>
		$<input type="number" id="netto" name="netto" />

		<label for="brutto">Brutto:</label>
		$<input type="number" id="brutto" name="brutto" />

		<label for="quantity">Quantity:</label>
		<input type="number" id="quantity" name="quantity" />

		<input type="submit" value="Add" />

		<p>{{ errMsg }}</p>
	</form>

	<button @click="onRecordRemove(4)">remove</button>

	<table>
		<tr>
			<th>id</th>
			<th>name</th>
			<th>netto</th>
			<th>brutto</th>
			<th>quantity</th>
			<th>remove</th>
		</tr>
		<template v-for="(datum, index) in data" v-bind:key="index">
			<tr v-if="(index >= (perPage*(page-1))) && (index <= perPage*page-1) && datum != undefined">
				<td>{{datum.id}}</td>
				<td>{{datum.name}}</td>
				<td>{{datum.netto}}</td>
				<td>{{datum.brutto}}</td>
				<td>{{datum.quantity}}</td>
				<td><button @click="onRecordRemove(index)">X</button></td>
			</tr>
		</template>
	</table>
</template>

<script>
	import axios from 'axios'

	export default {
		name: "DataTable",
		data() {
			return {
				data: [],
				page: 1,
				perPage: 25,
				isLeftPagDisabled: true,
				isRightPagDisabled: false,
				errMsg: ''
			}
		},
		methods: {
			fetchData: function () {
				console.log('test')
				axios.get('http://localhost:3000/data').then(res => {
					console.log(res.data)
					this.data = res.data
				}).catch(err => {
					console.error(err)
				})
			},
			sortData: function(e) {
				const sort_by = e.target.sort.value
				const sort_dir = e.target.sort_dir.value

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

				e.preventDefault()
			},
			addPage: function (value) {
				this.page -= value
				this.disablePags()
			},
			disablePags() {
				if(this.page ==  1) {
					this.isLeftPagDisabled = true
					this.isRightPagDisabled = false
				} else if(this.page >= this.data.length / this.perPage) {
					this.isLeftPagDisabled = false
					this.isRightPagDisabled = true
				} else {
					this.isLeftPagDisabled = false
					this.isRightPagDisabled = false
				}
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
					this.errMsg = 'At least one of the values is empty'
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

				e.preventDefault()
			},
			onRecordRemove(index) {
				const updatedData = this.data

				delete updatedData[index]
				this.data = updatedData
			}
		}	
	}
</script>

<style scoped>
</style>