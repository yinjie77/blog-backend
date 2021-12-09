const mongoose =require('mongoose')
if(process.argv.length<3)
{
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}
const password=process.argv[2]
const url=
`mongodb+srv://yinjie77:${password}@cluster0.tern7.mongodb.net/phonebook?retryWrites=true&w=majority`
mongoose.connect(url)
const phonebookSchema=new mongoose.Schema({
    name: String, 
    number: String
})
const Book=mongoose.model('Book',phonebookSchema)

if(process.argv.length===5)
{
    const book=new Book({
        name: process.argv[3],
        number: process.argv[4]
    })
    
    book.save().then(r=>{
        console.log(`added ${process.argv[3]} ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
}

else if(process.argv.length===3)
{
    Book.find({}).then(r=>{
        r.forEach(book=>{
            console.log(book)
        })
        mongoose.connection.close()
    })
}
