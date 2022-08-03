<template>
  <button @click="fetchData">Get Data</button>

	<div>
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


	<div>
		Current page: 
		<button @click="changePage(1)" :disabled="!isLeftPagOn">&lt;</button>
		{{ page }}
		<button @click="changePage(-1)" :disabled="!isRightPagOn">&gt;</button>
	</div>

	<form @submit="onNewRecordAdd">
		<label for="name">Name:</label>
		<input type="text" id="name" name="name" v-model="name" />

		<label for="netto">Netto:</label>
		$<input type="number" id="netto" name="netto" />

		<label for="brutto">Brutto:</label>
		$<input type="number" id="brutto" name="brutto" />

		<label for="quantity">Quantity:</label>
		<input type="number" id="quantity" name="quantity" />

		<input type="submit" value="Add" />

		<p>{{ errMsg }}</p>
	</form>

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
				isLeftPagOn: false,
				isRightPagOn: false,
				errMsg: '',
				sortProp: 'id',
				sortDirProp: 'asc',
				name: ''
			}
		},
		methods: {
			fetchData: function () {
				console.log('test')
				axios.get('http://localhost:3000/data').then(res => {
					console.log(res.data)
					this.data = res.data
					this.disablePags()
				}).catch(err => {
					console.error(err)
				})
			},
			sortData: function(sort_by, sort_dir) {
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
				this.disablePags()
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

				this.disablePags()

				e.preventDefault()
			},
			onRecordRemove(index) {
				const updatedData = this.data
				delete updatedData[index]
				this.data = updatedData
				this.sortData(this.sortProp, this.sortDirProp)
			},
			onFormChange(event) {
        console.log('working')
				console.log(event.target.value)
				this.sortData(this.sortProp, this.sortDirProp)
      }
		}	
	}
</script>

<style scoped>
</style>