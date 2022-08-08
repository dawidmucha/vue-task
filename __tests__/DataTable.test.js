import { mount } from '@vue/test-utils'
import DataTable from '@/components/DataTable'

import '../src/main'

describe('DataTable', () => {
	test('Should pass', () => {
		const wrapper = mount(DataTable)

		expect(wrapper.html()).toContain('Get Data')
	})

	test('Table should be hidden by default', () => {
		const wrapper = mount(DataTable)

		const dataTable_table = wrapper.findAll('[data-text="dataTable_table"]')

		expect(dataTable_table).toHaveLength(0)
	})
})