import React, { useState, useEffect } from 'react';
import {
    Settings,
    Zap,
    Target,
    Trophy,
    Activity,
    Layers,
    Hash,
    PlayCircle,
    CheckCircle2,
    ChevronDown,
    ShieldCheck,
    Info,
    HelpCircle
} from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const GAME_DEFAULTS = {
    free_fire: {
        killPoint: 1,
        placementPoints: [12, 9, 8, 7, 5, 4, 3, 2, 1, 1, 0, 0],
    },
    bgmi: {
        killPoint: 1,
        placementPoints: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1],
    },
    valorant: {
        killPoint: 1,
        placementPoints: [13, 0],
    },
    cod_mobile: {
        killPoint: 1,
        placementPoints: [15, 12, 10, 8, 6, 4, 3, 2, 1, 1],
    },
    csgo: {
        killPoint: 1,
        placementPoints: [1, 0],
    },
    generic: {
        killPoint: 1,
        placementPoints: [15, 12, 10, 8, 6, 4, 2, 1, 0, 0],
    }
};

const TIE_BREAKER_OPTIONS = [
    { id: 'total_kills', label: 'MOST KILLS', icon: Zap, hint: 'Team with more total kills wins ties.' },
    { id: 'highest_single_match_score', label: 'BEST SINGLE MATCH', icon: Target, hint: 'Team with highest score in one match wins ties.' },
    { id: 'head_to_head', label: 'DIRECT WIN', icon: Activity, hint: 'Winner of their direct match wins ties.' },
    { id: 'highest_placement', label: 'HIGHEST RANKS', icon: Trophy, hint: 'Team with more top-tier finishes wins ties.' },
];

const StageForm = ({ onSubmit, loading, tournamentGame }) => {
    const [formData, setFormData] = useState({
        name: '',
        stageNumber: 1,
        numberOfMatches: 6,
        ruleset: {
            killPoint: 1,
            placementPoints: [12, 9, 8, 7, 5, 4, 3, 2, 1, 1],
            multiplier: 1.0,
            bonusRules: [],
            tieBreakers: ['total_kills', 'highest_single_match_score'],
        },
    });

    const normalizedGame = typeof tournamentGame === 'string'
        ? tournamentGame.toLowerCase().trim().replace(/\s+/g, '_')
        : 'generic';

    useEffect(() => {
        if (tournamentGame) {
            const defaults = GAME_DEFAULTS[normalizedGame] || GAME_DEFAULTS.generic;
            setFormData(prev => ({
                ...prev,
                ruleset: {
                    ...prev.ruleset,
                    killPoint: defaults.killPoint,
                    placementPoints: defaults.placementPoints,
                }
            }));
        }
    }, [tournamentGame, normalizedGame]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stageNumber' || name === 'numberOfMatches' ? parseInt(value) || 0 : value,
        }));
    };

    const handleRulesetChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            ruleset: {
                ...prev.ruleset,
                [name]: name === 'killPoint' || name === 'multiplier' ? (value === '' ? '' : parseFloat(value)) : value,
            },
        }));
    };

    const handlePlacementPointsChange = (e) => {
        const val = e.target.value;
        const points = val.split(',').map((p) => {
            const num = parseFloat(p.trim());
            return isNaN(num) ? 0 : num;
        });
        setFormData(prev => ({
            ...prev,
            ruleset: {
                ...prev.ruleset,
                placementPoints: points,
            },
        }));
    };

    const toggleTieBreaker = (id) => {
        setFormData(prev => {
            const current = [...prev.ruleset.tieBreakers];
            const index = current.indexOf(id);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(id);
            }
            return {
                ...prev,
                ruleset: { ...prev.ruleset, tieBreakers: current }
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            ruleset: {
                ...formData.ruleset,
                killPoint: parseFloat(formData.ruleset.killPoint) || 0,
                multiplier: parseFloat(formData.ruleset.multiplier) || 1,
            }
        };
        onSubmit(finalData);
    };

    const applyPreset = (gameKey) => {
        const preset = GAME_DEFAULTS[gameKey];
        if (preset) {
            setFormData(prev => ({
                ...prev,
                ruleset: {
                    ...prev.ruleset,
                    killPoint: preset.killPoint,
                    placementPoints: preset.placementPoints
                }
            }));
            toast.success(`CONFIG: ${gameKey.toUpperCase()} settings loaded!`, {
                icon: '🛠️',
                style: { background: '#101214', color: '#fff', border: '1px solid rgba(0, 183, 255, 0.2)' },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-1">
            {/* Step 1: Basics */}
            <div className="bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-l-4 border-neon-purple pl-4">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic">1. Stage Basics</h3>
                        <p className="text-[10px] text-gray-500 font-medium">Define your phase names and tournament workflow.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Input
                            label="Stage Name (e.g. Qualifiers, Semi-Finals)"
                            icon={<Layers className="w-4 h-4" />}
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Type a name for this phase..."
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Input
                            label="Stage Order"
                            icon={<Hash className="w-4 h-4" />}
                            type="number"
                            name="stageNumber"
                            value={formData.stageNumber}
                            onChange={handleChange}
                            min="1"
                            placeholder="1"
                            required
                        />
                        <p className="text-[9px] text-gray-500 italic px-2">Determines position (1 = First, 2 = Second...)</p>
                    </div>

                    <div className="space-y-1">
                        <Input
                            label="Total Matches"
                            icon={<PlayCircle className="w-4 h-4" />}
                            type="number"
                            name="numberOfMatches"
                            value={formData.numberOfMatches}
                            onChange={handleChange}
                            min="1"
                            placeholder="6"
                            required
                        />
                        <p className="text-[9px] text-gray-500 italic px-2">How many games will be played in this stage?</p>
                    </div>
                </div>
            </div>

            {/* Step 2: Scoring */}
            <div className="bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-neon-blue pl-4">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic">2. Scoring Rules</h3>
                        <p className="text-[10px] text-gray-500 font-medium">Configure how teams earn points in matches.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Apply Preset:</span>
                        <div className="relative">
                            <select
                                className="bg-black/60 border border-white/10 rounded-xl text-[10px] font-black uppercase py-2 px-6 pr-10 text-neon-blue outline-none hover:border-neon-blue/50 transition-all appearance-none cursor-pointer"
                                onChange={(e) => applyPreset(e.target.value)}
                                value={normalizedGame}
                            >
                                {Object.keys(GAME_DEFAULTS).map(key => (
                                    <option key={key} value={key} className="bg-dark-950">{key.replace('_', ' ').toUpperCase()}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-neon-blue absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Points Per Kill"
                        icon={<Zap className="w-4 h-4" />}
                        type="number"
                        name="killPoint"
                        value={formData.ruleset.killPoint}
                        onChange={handleRulesetChange}
                        step="0.1"
                        min="0"
                        placeholder="1"
                        required
                    />

                    <Input
                        label="Point Multiplier"
                        icon={<Activity className="w-4 h-4" />}
                        type="number"
                        name="multiplier"
                        value={formData.ruleset.multiplier}
                        onChange={handleRulesetChange}
                        step="0.1"
                        min="0.1"
                        placeholder="1.0"
                        required
                    />

                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Points for Rank (1st to Last)</span>
                            <span className="text-neon-blue flex items-center gap-1"><Info className="w-3 h-3" /> Separated by commas</span>
                        </label>
                        <textarea
                            value={formData.ruleset.placementPoints?.join(', ') || ''}
                            onChange={handlePlacementPointsChange}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-neon-blue outline-none transition-all font-mono text-xs min-h-[80px]"
                            placeholder="e.g. 15, 12, 10, 8, 6, 4, 2, 1"
                            required
                        />
                    </div>

                    {/* Tie Breaker */}
                    <div className="md:col-span-2 pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tie-Breaker Priorities</label>
                            <span className="text-[9px] text-gray-500 italic">Select which rule breaks a point-tie first</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {TIE_BREAKER_OPTIONS.map((option) => {
                                const Icon = option.icon;
                                const isActive = formData.ruleset.tieBreakers.includes(option.id);
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => toggleTieBreaker(option.id)}
                                        className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 relative group
                                            ${isActive
                                                ? 'bg-neon-pink/10 border-neon-pink/50 text-white'
                                                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-neon-pink/20 text-neon-pink' : 'bg-dark-800'}`}>
                                                    <Icon className="w-3 h-3" />
                                                </div>
                                                <span className="text-[10px] font-black">{option.label}</span>
                                            </div>
                                            {isActive && <CheckCircle2 className="w-3 h-3 text-neon-pink" />}
                                        </div>
                                        <p className="text-[8px] text-gray-500 font-medium text-left leading-tight">{option.hint}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                fullWidth
                loading={loading}
                className="py-5 !rounded-3xl shadow-neon-blue/20 text-xs font-black uppercase tracking-widest italic"
            >
                Confirm & Create Stage
            </Button>
        </form>
    );
};

export default StageForm;