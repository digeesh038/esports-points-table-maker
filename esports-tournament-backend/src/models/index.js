import { sequelize } from '../config/database.js';
import User from './User.js';
import Organization from './Organization.js';
import Tournament from './Tournament.js';
import Stage from './Stage.js';
import Ruleset from './Ruleset.js';
import Team from './Team.js';
import Player from './Player.js';
import Match from './Match.js';
import MatchResult from './MatchResult.js';
import PlayerMatchResult from './PlayerMatchResult.js';

/* ======================
   Define Associations
====================== */

// User <-> Organization
User.hasMany(Organization, { foreignKey: 'ownerId', as: 'organizations', onDelete: 'CASCADE' });
Organization.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Organization <-> Tournament
Organization.hasMany(Tournament, { foreignKey: 'organizationId', as: 'tournaments', onDelete: 'CASCADE' });
Tournament.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });

// Tournament <-> Stage
Tournament.hasMany(Stage, { foreignKey: 'tournamentId', as: 'stages', onDelete: 'CASCADE' });
Stage.belongsTo(Tournament, { foreignKey: 'tournamentId', as: 'tournament' });

// Stage <-> Ruleset
Stage.hasOne(Ruleset, { foreignKey: 'stageId', as: 'ruleset', onDelete: 'CASCADE' });
Ruleset.belongsTo(Stage, { foreignKey: 'stageId', as: 'stage' });

// Tournament <-> Team
Tournament.hasMany(Team, { foreignKey: 'tournamentId', as: 'teams', onDelete: 'CASCADE' });
Team.belongsTo(Tournament, { foreignKey: 'tournamentId', as: 'tournament' });

// Team <-> Player
Team.hasMany(Player, { foreignKey: 'teamId', as: 'players', onDelete: 'CASCADE' });
Player.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Stage <-> Match
Stage.hasMany(Match, { foreignKey: 'stageId', as: 'matches', onDelete: 'CASCADE' });
Match.belongsTo(Stage, { foreignKey: 'stageId', as: 'stage' });

// Match <-> MatchResult
Match.hasMany(MatchResult, { foreignKey: 'matchId', as: 'results', onDelete: 'CASCADE' });
MatchResult.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });

// Team <-> MatchResult
Team.hasMany(MatchResult, { foreignKey: 'teamId', as: 'results', onDelete: 'CASCADE' });
MatchResult.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

// Match <-> PlayerMatchResult
Match.hasMany(PlayerMatchResult, { foreignKey: 'matchId', as: 'playerResults', onDelete: 'CASCADE' });
PlayerMatchResult.belongsTo(Match, { foreignKey: 'matchId', as: 'match' });

// Player <-> PlayerMatchResult
Player.hasMany(PlayerMatchResult, { foreignKey: 'playerId', as: 'matchResults', onDelete: 'CASCADE' });
PlayerMatchResult.belongsTo(Player, { foreignKey: 'playerId', as: 'player' });

// Team <-> PlayerMatchResult
Team.hasMany(PlayerMatchResult, { foreignKey: 'teamId', as: 'playerMatchResults', onDelete: 'CASCADE' });
PlayerMatchResult.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });

/* ======================
   Sync Database
====================== */

const syncDatabase = async (options = {}) => {
    try {
        await sequelize.sync(options);
        console.log('✅ Database synchronized successfully');
    } catch (error) {
        console.error('❌ Database sync error:', error);
        throw error;
    }
};

export {
    sequelize,
    syncDatabase,
    User,
    Organization,
    Tournament,
    Stage,
    Ruleset,
    Team,
    Player,
    Match,
    MatchResult,
    PlayerMatchResult,
};
