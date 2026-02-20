import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Stage = sequelize.define(
    'Stage',
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
        stageNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'stage_number',
        },
        totalMatches: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,   // ⭐ ADD THIS LINE
            field: 'total_matches',
        },

        status: {
            type: DataTypes.ENUM('pending', 'active', 'completed'),
            defaultValue: 'pending',
        },
    },
    {
        tableName: 'stages',
        timestamps: true,
        underscored: true,
    }
);

export default Stage;
