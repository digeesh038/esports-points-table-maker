import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Tournament = sequelize.define(
    'Tournament',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        organizationId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'organization_id',
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
        game: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        format: {
            type: DataTypes.STRING,
            defaultValue: 'league',
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'start_date',
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'end_date',
        },
        maxTeams: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'max_teams',
        },
        registrationDeadline: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'registration_deadline',
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'draft',
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_public',
        },
        banner: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        prizePool: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'prize_pool',
        },
    },
    {
        tableName: 'tournaments',
        timestamps: true,
        underscored: true,
    }
);

export default Tournament;
