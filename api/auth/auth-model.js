const db = require('../../data/dbConfig')

function findBy(filter) {
    return db('users').where(filter)
}

async function findById(id) {
    return db('users').where('id', id)
}

async function add({ username, password }) {
    const newUser = await db('users').insert({ username, password })
    return findById(newUser)
}

module.exports = {
    add,
    findById,
    findBy,
}