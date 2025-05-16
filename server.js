import http from 'node:http'
import path from 'node:path'
import pug from 'pug'
import fs from "node:fs"
import { formatDate, saveStudents, loadStudents } from './utils/utils.js'
import dotenv from 'dotenv'
import * as querystring from "querystring"

dotenv.config()

const HOST = process.env.APP_HOST
const PORT = process.env.APP_PORT

const dirname = import.meta.dirname
const viewPath = path.join(dirname, "view")
const assetsPath = path.join(dirname, "assets/css")

const server = http.createServer((req, res) => {
    const url = req.url.replace("/", "")

    if (url === "favicon.ico") {
        res.writeHead(200, {
            "content-type": "image/x-icon"
        })
        res.end()
        return
    }

    if (url.startsWith("assets")) {
		const stylesheetName = url.split("/").pop()
		const stylesheet = fs.readFileSync(path.join(assetsPath, stylesheetName))
		
		res.writeHead(200, {
			"content-type": "text/css"
		})
		res.end(stylesheet)
		return
	}

    if (url === '') {
        res.writeHead(200, {
            "content-type": "text/html"
        })

        pug.renderFile(path.join(viewPath, "home.pug"), { currentPath: "/" }, (err, data) => {
            if (err) throw err
            res.end(data)
        })
        return
    }

    if (url === 'users') {
        const students = loadStudents().map(student => ({ ...student, birthFormatted: formatDate(student.birth) }))
        res.writeHead(200, {
            'Content-Type': 'text/html'
        })

        pug.renderFile(path.join(viewPath, "users.pug"), { students, currentPath: "/users" }, (err, data) => {
            if (err) throw err
            res.end(data)
        })
        return
    }

    if (url === 'add') {
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        }).on('end', () => {
            const data = querystring.parse(body)
            const students = loadStudents()
            const maxId = students.length > 0 ? Math.max(...students.map(student => student.id)) : 0

            students.push({
                id: maxId+1,
                name: data.name,
                birth: data.birth
            })
            saveStudents(students)
            res.writeHead(302, { Location: '/users' })
            res.end()
        })
        return
    }

    if (url.startsWith('delete')) {
        const id = parseInt(url.split("/").pop())
        const students = loadStudents().filter(student => student.id !== id)
        saveStudents(students)
        res.writeHead(302, { Location: '/users' })
        res.end()
        return
    }

    if (url.startsWith('edit')) {
        const id = parseInt(url.split("/").pop())
        const student = loadStudents().find(student => student.id === id)
        res.writeHead(200, { 'Content-Type': 'text/html' })

        pug.renderFile(path.join(viewPath, "edit.pug"), { student }, (err, data) => {
            if (err) throw err
            res.end(data)
        })
        return
    }

    if (url.startsWith('update')) {
        const id = parseInt(url.split("/").pop())

        let body = ''
        req.on('data', chunk => {
            body += chunk.toString()
        }).on('end', () => {
            const data = querystring.parse(body)
            const students = loadStudents()
            const index = students.findIndex(student => student.id === id)
            students[index] = { id, name: data.name, birth: data.birth }
            saveStudents(students)

            res.writeHead(302, { Location: '/users' })
            res.end()
        })
        return
    }


    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Page non trouvée')
    }
})

server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`)
})