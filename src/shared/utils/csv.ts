import {extname, join} from 'path'

export const csvFileFilter = (req, file, callback) => {
	try {
		if (!file.originalname.match(/\.(csv)$/)) {
			return callback(new Error('Only CSV files are allowed!'), false)
		}
		callback(null, true)
	} catch (error) {
		throw error // throw error to service were it can be caught and logged
	}
}

export const csvFileName = (req, file, callback) => {
	try {
		
		const fileExtName = extname(file.originalname)
		callback(null, `data${fileExtName}`)
	} catch (error) {
		throw error // throw error to service were it can be caught and logged
	}
}

export const getCSVFile = () => {
	try {
		const filePath = join(__dirname, '..', '..', '..', 'uploads/csv', 'data.csv')
		return filePath
	} catch (error) {
		throw error // throw error to service were it can be caught and logged
	}
}

export const editFileName = (req, file, callback) => {
	try {
		const name = file.originalname.split('.')[0]
		const fileExtName = extname(file.originalname)
		const randomName = Array(4)
			.fill(null)
			.map(() => Math.round(Math.random() * 16).toString(16))
			.join('')
		callback(null, `${name}-${randomName}${fileExtName}`)
	} catch (error) {
		throw error // throw error to service were it can be caught and logged
	}
}
