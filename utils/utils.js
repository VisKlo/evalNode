import fs from 'node:fs'
import dayjs from 'dayjs'
import 'dayjs/locale/fr.js'
dayjs.locale('fr')

export const formatDate = (dateStr) => {
    return dayjs(dateStr).format('DD MMMM YYYY')
}

export const loadStudents = () => {
    return JSON.parse(fs.readFileSync('./data/students.json'))
}

export const saveStudents = (data) => {
    fs.writeFileSync('./data/students.json', JSON.stringify(data, null, 4))
}