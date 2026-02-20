import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PlayerMatchResult = sequelize.define(
    'PlayerMatchResult',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        matchId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'match_id',
        },
        teamId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'team_id',
        },
        playerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'player_id',
        },
        kills: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: 'player_match_results',
        timestamps: true,
        underscored: true,
    }
);

export default PlayerMatchResult;
