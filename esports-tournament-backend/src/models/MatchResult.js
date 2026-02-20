import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const MatchResult = sequelize.define(
    'MatchResult',
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
        kills: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        placement: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        killPoints: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'kill_points',
        },
        placementPoints: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'placement_points',
        },
        bonusPoints: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'bonus_points',
        },
        totalPoints: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            field: 'total_points',
        },
        topPlayerName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'top_player_name',
        },
        topPlayerId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'top_player_id',
        },
    },
    {
        tableName: 'match_results',
        timestamps: true,
        underscored: true,
    }
);

export default MatchResult;
