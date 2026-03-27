import pool from './src/db';

async function checkPlans() {
    try {
        const plans = await pool.query('SELECT name, price FROM plans');
        console.log('Plans in DB:');
        console.table(plans.rows);
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error(err);
        await pool.end();
        process.exit(1);
    }
}

checkPlans();
