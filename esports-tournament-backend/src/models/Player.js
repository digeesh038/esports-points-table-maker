import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Player = sequelize.define(
    'Player',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        teamId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'team_id',
        },
        inGameName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'in_game_name',
        },
        inGameId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'in_game_id',
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: 'players',
        timestamps: true,
        underscored: true,
    }
);

export default Player;
