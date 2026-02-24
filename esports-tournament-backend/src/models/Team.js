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
        // ── Payment ────────────────────────────────────────────────
        paymentStatus: {
            type: DataTypes.ENUM('none', 'pending', 'completed', 'failed'),
            defaultValue: 'none',
            field: 'payment_status',
        },
        paymentMethod: {
            type: DataTypes.STRING,
            defaultValue: 'none',
            field: 'payment_method',
        },
        // Auto-populated from tournament.entryFee at registration time
        paymentAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'payment_amount',
        },
        // UPI Transaction ID submitted by the player after paying
        upiTransactionId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'upi_transaction_id',
        },
        // Legacy / unused — kept so old rows don't break
        paymentProof: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'payment_proof',
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
