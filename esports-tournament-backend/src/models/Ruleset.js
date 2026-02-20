import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Ruleset = sequelize.define(
    'Ruleset',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        stageId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            field: 'stage_id',
        },
        killPoints: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: { perKill: 1 },
            field: 'kill_points',
        },
        placementPoints: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                1: 15, 2: 12, 3: 10, 4: 8, 5: 6,
                6: 4, 7: 2, 8: 1, 9: 0, 10: 0
            },
            field: 'placement_points',
        },
        multiplier: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 1.0,
        },
        bonusRules: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: 'bonus_rules',
        },
        tieBreakers: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: ['total_kills', 'highest_single_match_score', 'head_to_head'],
            field: 'tie_breakers',
        },
    },
    {
        tableName: 'rulesets',
        timestamps: true,
        underscored: true,
    }
);

export default Ruleset;
