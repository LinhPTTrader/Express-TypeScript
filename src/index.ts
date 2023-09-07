interface User {
    name: string,
    age: number
}

const render = (user: User) => {
    console.log(user)
}

render({ name: 'LinhPhan', age: 28 }) // Đúng theo Type User
// render({ name: 'LinhPhan', age: '28' })  //Sai với Type User vì thiếu Age
const user = { name: 'Linh' }
render(user as User) // Su dung as để cho TypeScript hiểu là User mình truyền đúng kiểu dử liệu

const profile: any = {
    name: 'Linh'
}


// Lỗi Node JS, chủ yếu liên quan đến Login và cần phải sữa triệt để, không được để tồn đọng
import express from 'express'
const app = express()
const PORT = 3000

app.get('/', (req, res) => {
    res.send('HelloWord')
})
app.listen(PORT, () => {
    console.log('Server Start')
})