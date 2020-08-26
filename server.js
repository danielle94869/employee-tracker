const { prompt } = require('inquirer')
const mysql = require('mysql2')
require('console.table')

const db = mysql.createConnection('mysql://root:rootroot@localhost/employee_db')

const mainMenu = () => {
  prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'Choose an action:',
      choices: [
        {
          name: 'View Employees',
          value: 'viewEmployees'
        },
        {
          name: 'Add An Employee',
          value: 'addEmployee'
        },
        {
          name: 'Update An Employee\'s Role',
          value: 'updateEmployeeRole'
        },
        {
          name: 'View Departments',
          value: 'viewDepartments'
        },
        {
          name: 'Add A Department',
          value: 'addDepartment'
        },
        {
          name: 'View Roles',
          value: 'viewRoles'
        },
        {
          name: 'Add A Role',
          value: 'addRole'
        }
      ]
    }
  ])
    .then(({ choice }) => {
      switch (choice) {
        case 'viewEmployees':
          viewEmployees()
          break
        case 'addEmployee':
          addEmployee()
          break
        case 'updateEmployeeRole':
          updateEmployeeRole()
          break
        case 'viewDepartments':
          viewDepartments()
          break
        case 'addDepartment':
          addDepartment()
          break
        case 'viewRoles':
          viewRoles()
          break
        case 'addRole':
          addRole()
          break
      }
    })
    .catch(err => console.log(err))
}

const viewEmployees = () => {
  db.query(`
    SELECT employee.id, employee.first_name, employee.last_name,
      role.title, role.salary, department.name AS department,
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role
    ON employee.role_id = role.id
    LEFT JOIN department
    ON role.department_id = department.id
    LEFT JOIN employee manager
    ON manager.id = employee.manager_id
  `, (err, employees) => {
    if (err) { console.log(err) }
    console.table(employees)
    mainMenu()
  })
}

const addEmployee = () => {
  db.query('SELECT * FROM role', (err, roles) => {
    if (err) { console.log(err) }

    roles = roles.map(role => ({
      name: role.title,
      value: role.id
    }))

    db.query('SELECT * FROM employee', (err, employees) => {
      employees = employees.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        value: employee.id
      }))

      employees.unshift({ name: 'None', value: null })

      prompt([
        {
          type: 'input',
          name: 'first_name',
          message: 'What is the employee first name?'
        },
        {
          type: 'input',
          name: 'last_name',
          message: 'What is the employee last name?'
        },
        {
          type: 'list',
          name: 'role_id',
          message: 'Choose a role for the employee:',
          choices: roles
        },
        {
          type: 'list',
          name: 'manager_id',
          message: 'Choose a manager for the employee:',
          choices: employees
        }
      ])
        .then(employee => {
          db.query('INSERT INTO employee SET ?', employee, (err) => {
            if (err) { console.log(err) }
            console.log('Employee Created!')
            mainMenu()
          })
        })
        .catch(err => console.log(err))
    })
  })
}
//
const updateEmployeeRole = () => {
  db.query('SELECT * FROM role', (err, roles) => {
    if (err) { console.log(err) }

    roles = roles.map(role => ({
      name: role.title,
      value: role.id
    }))

    db.query('SELECT * FROM employee', (err, employees) => {
      employees = employees.map(employee => ({
        name: `${employee.first_name} ${employee.last_name}`,
        role_id: employee.role_id,
        value: employee.id
      }))

      employees.unshift({ name: 'None', value: null })

      const input = prompt([
        {
          type: 'input',
          name: 'first_name',
          message: 'What is the employee first name?'
        },
        {
          type: 'input',
          name: 'last_name',
          message: 'What is the employee last name?'
        },
        {
          type: 'list',
          name: 'role_id',
          message: 'Choose a new role for the employee:',
          choices: roles
        }
      ])
        .then((res, req) => {
          console.log(res)
          db.query('UPDATE employee SET role_id = ? WHERE CONCAT(first_name,\' \',last_name) = ?', [res.role_id, `${res.first_name} ${res.last_name}`], (err) => {
            if (err) { console.log(err) }
            console.log('Employee Updated!')
            mainMenu()
          })
        })
    })
  })
}

const viewDepartments = () => {
  db.query(`
    SELECT department.name, department.id
    FROM department
  `, (err, departments) => {
    if (err) { console.log(err) }
    console.table(departments)
    mainMenu()
  })
}

const addDepartment = () => {
  db.query('SELECT * FROM department', (err, departments) => {
    if (err) { console.log(err) }

    departments = departments.map(department => ({
      name: department.title,
      value: department.id
    }))

    departments.unshift({ name: 'None', value: null })

    prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the department name?'
      }
    ])
      .then(department => {
        db.query('INSERT INTO department SET ?', department, (err) => {
          if (err) { console.log(err) }
          console.log('Department Created!')
          mainMenu()
        })
      })
      .catch(err => console.log(err))
  })
}

const viewRoles = () => {
  db.query(`
    SELECT role.title, role.salary,
    department.name AS department, department.id
    FROM department
    LEFT JOIN role
    ON role.department_id = department.id

  `, (err, roles) => {
    if (err) { console.log(err) }
    console.table(roles)
    mainMenu()
  })
}

const addRole = () => {
  db.query('SELECT * FROM department', (err, departments) => {
    if (err) { console.log(err) }

    departments = departments.map(department => ({
      name: department.name,
      value: department.id
    }))

    db.query('SELECT * FROM role', (err, roles) => {
      roles = roles.map(role => ({
        title: role.title,
        value: role.id
      }))

      roles.unshift({ title: 'None', value: null })

      prompt([
        {
          type: 'input',
          name: 'title',
          message: 'What is the role?'
        },
        {
          type: 'input',
          name: 'salary',
          message: 'What is the salary?'
        },
        {
          type: 'list',
          name: 'department_id',
          message: 'What is the department you want to add role?',
          choices: departments
        }
      ])
        .then(role => {
          db.query('INSERT INTO role SET ?', role, (err) => {
            if (err) { console.log(err) }
            console.log('Role Created!')
            mainMenu()
          })
        })
        .catch(err => console.log(err))
    })
  })
}

mainMenu()
