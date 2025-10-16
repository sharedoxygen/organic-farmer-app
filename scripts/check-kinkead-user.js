#!/usr/bin/env node

/**
 * Check Kinkead User Status
 * 
 * Diagnostic tool to verify user account status, password validity,
 * and farm associations for the Kinkead user account.
 * 
 * @author Shared Oxygen, LLC
 * @copyright 2025 Shared Oxygen, LLC. All rights reserved.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkKinkeadUser() {
    console.log('🔍 Checking Kinkead user status...\n');

    try {
        // Check for the user by email
        const email = 'kinkead@curryislandmicrogreens.com';
        
        const user = await prisma.users.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user) {
            console.log('❌ User NOT FOUND in database');
            console.log('   Email searched:', email);
            
            // Check if there are any similar emails
            const similarUsers = await prisma.users.findMany({
                where: {
                    email: {
                        contains: 'kinkead'
                    }
                }
            });
            
            if (similarUsers.length > 0) {
                console.log('\n📋 Found similar emails:');
                similarUsers.forEach(u => {
                    console.log(`   - ${u.email} (Active: ${u.isActive})`);
                });
            }
            
            return;
        }

        console.log('✅ User FOUND in database');
        console.log('📊 User Details:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Active: ${user.isActive}`);
        console.log(`   Department: ${user.department}`);
        console.log(`   Position: ${user.position}`);
        console.log(`   Roles: ${user.roles}`);
        console.log(`   Permissions: ${user.permissions}`);
        console.log(`   Last Login: ${user.lastLogin}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Updated: ${user.updatedAt}`);

        // Check password format
        const passwordHash = user.password;
        const isHashed = passwordHash.startsWith('$2a$') || 
                        passwordHash.startsWith('$2b$') || 
                        passwordHash.startsWith('$2y$');
        
        console.log(`\n🔐 Password Status:`);
        console.log(`   Format: ${isHashed ? 'HASHED (bcrypt)' : 'PLAINTEXT'}`);
        console.log(`   Length: ${passwordHash.length} characters`);
        
        if (isHashed) {
            // Test the password
            const testPassword = 'curryislandadmin123!';
            const isValid = await bcrypt.compare(testPassword, passwordHash);
            console.log(`   Test password "${testPassword}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        }

        // Check farm associations
        const farmAssociations = await prisma.farm_users.findMany({
            where: { user_id: user.id },
            include: { farms: true }
        });

        console.log(`\n🏢 Farm Associations: ${farmAssociations.length}`);
        if (farmAssociations.length > 0) {
            farmAssociations.forEach(assoc => {
                console.log(`   ✅ ${assoc.farms.farm_name}`);
                console.log(`      Role: ${assoc.role}`);
                console.log(`      Active: ${assoc.is_active}`);
                console.log(`      Joined: ${assoc.joined_at}`);
            });
        } else {
            console.log('   ⚠️ NO FARM ASSOCIATIONS FOUND');
            console.log('   This user cannot access any farm data!');
        }

        // Check if user can login
        console.log(`\n🔓 Login Status:`);
        if (!user.isActive) {
            console.log('   ❌ CANNOT LOGIN - User is inactive');
        } else if (farmAssociations.length === 0) {
            console.log('   ⚠️ CAN LOGIN but has NO FARM ACCESS');
        } else {
            console.log('   ✅ CAN LOGIN and has farm access');
        }

    } catch (error) {
        console.error('❌ ERROR:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the check
if (require.main === module) {
    checkKinkeadUser()
        .then(() => {
            console.log('\n✅ Check completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Check failed:', error);
            process.exit(1);
        });
}

module.exports = { checkKinkeadUser };
