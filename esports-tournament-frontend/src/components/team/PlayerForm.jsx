import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { User, Shield, Target } from 'lucide-react';

const PlayerForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        inGameName: '',
        inGameId: '',
        role: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ inGameName: '', inGameId: '', role: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 bg-dark-900/30 p-2">
            <h3 className="text-xs font-black text-neon-pink tracking-[0.1em] mb-4 uppercase flex items-center gap-2 italic">
                <User className="w-3.5 h-3.5" /> ADD_NEW_PLAYER
            </h3>

            <Input
                label="PLAYER_NAME"
                type="text"
                value={formData.inGameName}
                onChange={(e) => setFormData({ ...formData, inGameName: e.target.value })}
                placeholder="e.g. Neo"
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="GAME_ID"
                    type="text"
                    value={formData.inGameId}
                    onChange={(e) => setFormData({ ...formData, inGameId: e.target.value })}
                    placeholder="e.g. 123456"
                />
                <Input
                    label="PLAYER_ROLE"
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. SNIPER"
                />
            </div>

            <Button
                type="submit"
                fullWidth
                loading={loading}
                className="py-3 shadow-[0_0_20px_rgba(255,0,111,0.2)] text-[11px] font-black uppercase tracking-[0.2em] italic"
            >
                SAVE_PLAYER
            </Button>
        </form>
    );
};

export default PlayerForm;
