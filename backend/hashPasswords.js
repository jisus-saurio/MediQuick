// hashPasswords.js - Script para hashear contraseñas existentes en texto plano
import bcrypt from 'bcryptjs';
import clientModel from './src/models/Users.js';
import employeesModel from './src/models/Employees.js';
import './database.js'; // Conectar a la base de datos

async function hashExistingPasswords() {
    console.log('🔧 Iniciando proceso de hasheo de contraseñas...');
    
    try {
        // Procesar usuarios (clientes)
        console.log('\n👤 Procesando usuarios (clientes)...');
        const users = await clientModel.find({});
        let usersUpdated = 0;
        
        for (const user of users) {
            // Verificar si la contraseña ya está hasheada
            const isHashed = user.password.startsWith('$2');
            
            if (!isHashed) {
                console.log(`📝 Hasheando contraseña para usuario: ${user.email}`);
                const hashedPassword = await bcrypt.hash(user.password, 10);
                
                await clientModel.findByIdAndUpdate(user._id, {
                    password: hashedPassword
                });
                
                usersUpdated++;
            } else {
                console.log(`✅ Usuario ${user.email} ya tiene contraseña hasheada`);
            }
        }
        
        // Procesar empleados
        console.log('\n👨‍💼 Procesando empleados...');
        const employees = await employeesModel.find({});
        let employeesUpdated = 0;
        
        for (const employee of employees) {
            // Verificar si la contraseña ya está hasheada
            const isHashed = employee.password.startsWith('$2');
            
            if (!isHashed) {
                console.log(`📝 Hasheando contraseña para empleado: ${employee.email}`);
                const hashedPassword = await bcrypt.hash(employee.password, 10);
                
                await employeesModel.findByIdAndUpdate(employee._id, {
                    password: hashedPassword
                });
                
                employeesUpdated++;
            } else {
                console.log(`✅ Empleado ${employee.email} ya tiene contraseña hasheada`);
            }
        }
        
        console.log('\n🎉 Proceso completado:');
        console.log(`📊 Usuarios actualizados: ${usersUpdated}`);
        console.log(`📊 Empleados actualizados: ${employeesUpdated}`);
        console.log(`📊 Total: ${usersUpdated + employeesUpdated} contraseñas hasheadas`);
        
        if (usersUpdated + employeesUpdated > 0) {
            console.log('\n⚠️  IMPORTANTE: Ahora todas las contraseñas están hasheadas.');
            console.log('💡 Puedes actualizar el loginController para usar solo bcrypt.compare()');
        }
        
    } catch (error) {
        console.error('❌ Error durante el proceso:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar el script
hashExistingPasswords();