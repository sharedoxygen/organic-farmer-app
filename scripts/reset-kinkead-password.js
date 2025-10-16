#!/usr/bin/env node

/**
 * Reset Kinkead User Password
 * 
 * Utility script to reset the Kinkead user password to a known value
 * and verify the password works correctly.
 * 
 * @author Shared Oxygen, LLC
 * @copyright 2025 Shared Oxygen, LLC. All rights reserved.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetKinkeadPassword() {
    console.log('🔐 Resetting Kinkead password...\n');

    try {
        const email = 'kinkead@curryislandmicrogreens.com';
        const newPassword = 'curryislandadmin123!';
        
        // Check if user exists
        const user = await prisma.users.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user) {
            console.log('❌ User not found:', email);
            return;
        }

        console.log('✅ User found:', email);
        console.log('   ID:', user.id);
        console.log('   Name:', user.firstName, user.lastName);

        // Hash the new password
        console.log('\n🔒 Hashing new password...');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('   Hash:', hashedPassword.substring(0, 20) + '...');

        // Update the password
        console.log('\n💾 Updating password in database...');
        await prisma.users.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                updatedAt: new Date()
            }
        });

        console.log('✅ Password updated successfully!');

        // Verify the password works
        console.log('\n🔍 Verifying password...');
        const updatedUser = await prisma.users.findUnique({
            where: { id: user.id }
        });

        const isValid = await bcrypt.compare(newPassword, updatedUser.password);
        
        if (isValid) {
            console.log('✅ Password verification SUCCESSFUL!');
            console.log('\n📋 Login Credentials:');
            console.log('   Email:', email);
            console.log('   Password:', newPassword);
            console.log('\n🎉 You can now login with these credentials!');
        } else {
            console.log('❌ Password verification FAILED!');
        }

    } catch (error) {
        console.error('❌ ERROR:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the reset
if (require.main === module) {
    resetKinkeadPassword()
        .then(() => {
            console.log('\n✅ Password reset completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Password reset failed:', error);
            process.exit(1);
        });
}

module.exports = { resetKinkeadPassword };
