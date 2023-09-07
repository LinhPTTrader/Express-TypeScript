type Handle = () => Promise<string>
const ten = 'LinhPhan'

const handle: Handle = () => Promise.resolve(ten)
handle().then((res) => console.log(res))
