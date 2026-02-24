import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Payment = sequelize.define(
    'Payment',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tournamentId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'tournament_id',
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id',
        },
        teamId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'team_id',
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'INR',
        },
        razorpayOrderId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'razorpay_order_id',
        },
        razorpayPaymentId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'razorpay_payment_id',
        },
        razorpaySignature: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'razorpay_signature',
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'PENDING',
        },
        receiptNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            field: 'receipt_number',
        },
    },
    {
        tableName: 'payments',
        timestamps: true,
        underscored: true,
    }
);

export default Payment;
