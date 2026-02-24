import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Team = sequelize.define(
    'Team',
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        logo: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        contactEmail: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'contact_email',
        },
        contactName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'contact_name',
        },
        contactPhone: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'contact_phone',
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
        },
        registeredAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'registered_at',
        },
        paymentStatus: {
            type: DataTypes.ENUM('none', 'pending', 'completed', 'failed'),
            defaultValue: 'none',
            field: 'payment_status',
        },
        razorpayPaymentId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'razorpay_payment_id',
        },
        razorpayOrderId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'razorpay_order_id',
        },
        razorpaySignature: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'razorpay_signature',
        },
    },
    {
        tableName: 'teams',
        timestamps: true,
        underscored: true,
    }
);

export default Team;
