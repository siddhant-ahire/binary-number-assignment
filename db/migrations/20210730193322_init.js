
const createTables = knex => tables => {
    const createTable = tables.map(({name,schema})=>{
        return knex.schema.createTable(name,schema)
    });
    return Promise.all(createTable)
        .catch(e => {
            const dropTables = tables.map(({name})=> {
                return knex.schema.dropTableIfExists(name);
            });
            return Promise.all(dropTables).then(()=> Promise.reject(e));
        });
}



exports.up = function(knex,Promise) {
  return createTables(knex)([
      {
          name:"users",
          schema(usersTable){
              usersTable.increments('user_id').primary();
              usersTable.string('username').unique();
              usersTable.string('password');
              usersTable.integer('role').notNullable().defaultTo(0);
              usersTable.string('salt');
              usersTable.timestamps(true, true)
          }
      },
      {
          name:"accounts",
          schema(accountsTable){
            accountsTable.increments('transaction_id').primary();
            accountsTable.string('action');
            accountsTable.string('amount');
            accountsTable.integer('current_amount').notNullable().defaultTo(0);
            accountsTable.integer('u_id').unsigned().index().references('user_id').inTable('users');
            accountsTable.timestamps(true, true)
          }
      }

  ])
};

exports.down = function(knex) {
  return knex.schema.dropTable('users')
};
