import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Organization = sequelize.define(
    'Organization',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        ownerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'owner_id',
        },
        subscriptionPlan: {
            type: DataTypes.ENUM('free', 'pro', 'enterprise'),
            defaultValue: 'free',
            field: 'subscription_plan',
        },
        subscriptionStatus: {
            type: DataTypes.ENUM('active', 'inactive', 'cancelled'),
            defaultValue: 'active',
            field: 'subscription_status',
        },
    },
    {
        tableName: 'organizations',
        timestamps: true,
        underscored: true,
    }
);

export default Organization;
