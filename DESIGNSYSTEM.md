# Design System — EvoConnect

## Identidade
A estética do EvoConnect é **Premium Digital**, focada em simplicidade, confiança e sofisticação. Utiliza elementos de "Glassmorphism" para dar profundidade e transparência ao processo de conexão.

## Paleta
```css
:root {
  --bg-dark: #0A0A0B;
  --bg-card: rgba(23, 23, 26, 0.7);
  --border-glass: rgba(255, 255, 255, 0.1);
  
  --primary: #8B5CF6; /* Violet 500 */
  --primary-glow: rgba(139, 92, 246, 0.4);
  --accent: #D946EF; /* Fuchsia 500 */
  
  --text-primary: #F9FAFB;
  --text-secondary: #9CA3AF;
  
  --success: #10B981;
  --error: #EF4444;
}
```

## Tipografia
- **Font-Family**: 'Inter', system-ui, sans-serif.
- **Header**: Semi-bold (600), com espaçamento reduzido.
- **Body**: Regular (400), linha (1.6).

## Componentes Base
### Glass Card
```css
.card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  padding: 24px;
}
```

### Action Button
```css
.button-primary {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px var(--primary-glow);
}

.button-primary:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}
```

## Regras de Uso
- **Contraste**: Nunca usar texto escuro em fundo escuro.
- **Ícones**: Usar ícones de linha fina (Lucide) com 1.5px ou 2px de espessura.
- **Animações**: Transições de 200ms a 300ms com cubic-bezier(.4,0,.2,1).
