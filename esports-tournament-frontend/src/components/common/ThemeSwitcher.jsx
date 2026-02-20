const themes = {
    blue: 'from-blue-500 to-purple-600',
    red: 'from-red-500 to-pink-600',
    green: 'from-green-400 to-emerald-600',
};

const ThemeSwitcher = ({ setTheme }) => (
    <div className="flex justify-center gap-3 mt-6">
        {Object.keys(themes).map((t) => (
            <button
                key={t}
                onClick={() => setTheme(themes[t])}
                className={`w-6 h-6 rounded-full bg-gradient-to-r ${themes[t]}`}
            />
        ))}
    </div>
);

export default ThemeSwitcher;
