import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Match = sequelize.define(
    'Match',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        stageId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'stage_id',
        },
        matchNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'match_number',
        },
        customTitle: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'custom_title',
        },
        mapName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'map_name',
        },
        scheduledTime: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'scheduled_time',
        },
        status: {
            type: DataTypes.ENUM('scheduled', 'live', 'completed', 'cancelled'),
            defaultValue: 'scheduled',
        },
        isLocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_locked',
        },
    },
    {
        tableName: 'matches',
        timestamps: true,
        underscored: true,
    }
);

export default Match;
