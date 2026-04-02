
(function(){
  function q(selector, scope=document){ return scope.querySelector(selector); }
  function qa(selector, scope=document){ return Array.from(scope.querySelectorAll(selector)); }

  function getNum(id){
    const el = document.getElementById(id);
    if(!el) return 0;
    const value = parseFloat(String(el.value).replace(',', '.'));
    return Number.isFinite(value) ? value : 0;
  }

  function money(n, currency='USD'){
    try{
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
      }).format(n);
    }catch(err){
      return `${currency} ${Math.round(n).toLocaleString('es-ES')}`;
    }
  }

  function number(n, digits=0){
    return new Intl.NumberFormat('es-ES', {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits
    }).format(n);
  }

  function saveHistory(tool, summary){
    const key = `ingresolab_history_${tool}`;
    let items = [];
    try{
      items = JSON.parse(localStorage.getItem(key) || '[]');
    }catch(err){}
    items.unshift({ date: new Date().toLocaleString('es-CO'), summary });
    items = items.slice(0, 6);
    localStorage.setItem(key, JSON.stringify(items));
    renderHistory(tool);
  }

  function renderHistory(tool){
    const container = document.querySelector(`[data-history="${tool}"]`);
    if(!container) return;
    let items = [];
    try{
      items = JSON.parse(localStorage.getItem(`ingresolab_history_${tool}`) || '[]');
    }catch(err){}
    if(!items.length){
      container.innerHTML = '<p class="muted">Tus últimos resultados aparecerán aquí en este navegador.</p>';
      return;
    }
    container.innerHTML = items.map(item => (
      `<div class="link-card"><strong>${item.summary}</strong><small>${item.date}</small></div>`
    )).join('');
  }

  function attachSubmit(formSelector, toolName, callback){
    const form = document.querySelector(formSelector);
    if(!form) return;
    renderHistory(toolName);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      callback(form);
    });
  }

  attachSubmit('[data-calculator="salary"]', 'salary', () => {
    const hourly = getNum('salary-hourly');
    const hours = getNum('salary-hours');
    const weeks = getNum('salary-weeks');
    const currency = q('#salary-currency').value || 'USD';
    const weekly = hourly * hours;
    const monthly = (weekly * weeks) / 12;
    const annual = weekly * weeks;
    const daily = hourly * (hours / 5);

    q('#salary-result').classList.remove('hide');
    q('#salary-main').textContent = money(monthly, currency);
    q('#salary-weekly').innerHTML = `<strong>${money(weekly, currency)}</strong><span>Por semana</span>`;
    q('#salary-annual').innerHTML = `<strong>${money(annual, currency)}</strong><span>Por año</span>`;
    q('#salary-daily').innerHTML = `<strong>${money(daily, currency)}</strong><span>Por día laborable</span>`;
    q('#salary-note').textContent = `Con ${number(hours)} horas por semana y ${number(weeks)} semanas pagadas, tu ingreso mensual aproximado sería ${money(monthly, currency)}.`;
    saveHistory('salary', `${money(hourly, currency)}/h ≈ ${money(monthly, currency)}/mes`);
  });

  attachSubmit('[data-calculator="freelance"]', 'freelance', () => {
    const target = getNum('freelance-target');
    const taxes = getNum('freelance-taxes') / 100;
    const overhead = getNum('freelance-overhead') / 100;
    const billableHours = getNum('freelance-hours');
    const weeks = getNum('freelance-weeks');
    const currency = q('#freelance-currency').value || 'USD';

    const grossNeeded = target / Math.max(0.05, (1 - taxes - overhead));
    const yearlyHours = Math.max(1, billableHours * weeks);
    const hourlyRate = grossNeeded / yearlyHours;
    const dailyRate = hourlyRate * 6;
    const projectBase = hourlyRate * 20;

    q('#freelance-result').classList.remove('hide');
    q('#freelance-main').textContent = money(hourlyRate, currency);
    q('#freelance-hour').innerHTML = `<strong>${money(hourlyRate, currency)}</strong><span>Tarifa por hora recomendada</span>`;
    q('#freelance-day').innerHTML = `<strong>${money(dailyRate, currency)}</strong><span>Tarifa por día de 6 horas</span>`;
    q('#freelance-project').innerHTML = `<strong>${money(projectBase, currency)}</strong><span>Piso para proyecto de 20 horas</span>`;
    q('#freelance-note').textContent = `Para quedarte con ${money(target, currency)} al año, cubriendo impuestos y gastos, deberías cobrar alrededor de ${money(hourlyRate, currency)} por hora facturable.`;
    saveHistory('freelance', `${money(hourlyRate, currency)}/hora para meta de ${money(target, currency)}`);
  });

  attachSubmit('[data-calculator="creator"]', 'creator', () => {
    const followers = getNum('creator-followers');
    const engagement = getNum('creator-engagement') / 100;
    const conversion = getNum('creator-conversion') / 100;
    const price = getNum('creator-price');
    const sponsorCpm = getNum('creator-sponsor-cpm');
    const posts = getNum('creator-posts');
    const currency = q('#creator-currency').value || 'USD';

    const engagedAudience = followers * engagement;
    const sponsorBase = (followers / 1000) * sponsorCpm * Math.max(0.7, engagement * 20);
    const sponsorLow = sponsorBase * posts * 0.8;
    const sponsorHigh = sponsorBase * posts * 1.25;
    const productSales = engagedAudience * conversion;
    const productRevenue = productSales * price;
    const combined = ((sponsorLow + sponsorHigh) / 2) + productRevenue;
    const progress = Math.min(100, Math.max(4, engagement * 1400));

    q('#creator-result').classList.remove('hide');
    q('#creator-main').textContent = money(combined, currency);
    q('#creator-sponsor').innerHTML = `<strong>${money(sponsorLow, currency)} – ${money(sponsorHigh, currency)}</strong><span>Rango estimado de patrocinios al mes</span>`;
    q('#creator-product').innerHTML = `<strong>${money(productRevenue, currency)}</strong><span>Ventas potenciales de producto o comunidad</span>`;
    q('#creator-engaged').innerHTML = `<strong>${number(engagedAudience)}</strong><span>Audiencia comprometida aproximada</span>`;
    q('#creator-progress span').style.width = `${progress}%`;
    q('#creator-note').textContent = `No es una promesa de ingresos. Es una forma de convertir seguidores, engagement y oferta en un rango más útil para planear contenido, cierres y metas.`;
    saveHistory('creator', `${number(followers)} seguidores ≈ ${money(combined, currency)}/mes`);
  });

  attachSubmit('[data-calculator="raise"]', 'raise', () => {
    const current = getNum('raise-current');
    const increase = getNum('raise-percent') / 100;
    const inflation = getNum('raise-inflation') / 100;
    const taxes = getNum('raise-tax') / 100;
    const currency = q('#raise-currency').value || 'USD';

    const newSalary = current * (1 + increase);
    const diff = newSalary - current;
    const afterTax = diff * (1 - taxes);
    const realGainPct = ((1 + increase) / (1 + inflation) - 1) * 100;
    const monthlyNet = afterTax / 12;

    q('#raise-result').classList.remove('hide');
    q('#raise-main').textContent = `${number(realGainPct, 2)}%`;
    q('#raise-gross').innerHTML = `<strong>${money(diff, currency)}</strong><span>Aumento bruto anual</span>`;
    q('#raise-net').innerHTML = `<strong>${money(afterTax, currency)}</strong><span>Aumento anual después de impuestos</span>`;
    q('#raise-month').innerHTML = `<strong>${money(monthlyNet, currency)}</strong><span>Impacto neto mensual</span>`;
    q('#raise-note').textContent = `Tu nuevo salario sería ${money(newSalary, currency)} al año. Ajustando por inflación, tu mejora real ronda ${number(realGainPct, 2)}%.`;
    saveHistory('raise', `Aumento real ${number(realGainPct,2)}% | +${money(monthlyNet, currency)}/mes`);
  });

  attachSubmit('[data-calculator="budget"]', 'budget', () => {
    const income = getNum('budget-income');
    const currency = q('#budget-currency').value || 'USD';
    const needs = income * 0.5;
    const wants = income * 0.3;
    const savings = income * 0.2;

    q('#budget-result').classList.remove('hide');
    q('#budget-main').textContent = money(savings, currency);
    q('#budget-needs').innerHTML = `<strong>${money(needs, currency)}</strong><span>Necesidades</span>`;
    q('#budget-wants').innerHTML = `<strong>${money(wants, currency)}</strong><span>Gustos</span>`;
    q('#budget-savings').innerHTML = `<strong>${money(savings, currency)}</strong><span>Ahorro o deuda</span>`;
    q('#budget-needs-bar').style.width = '50%';
    q('#budget-wants-bar').style.width = '30%';
    q('#budget-savings-bar').style.width = '20%';
    q('#budget-note').textContent = `Si tu ingreso mensual neto es ${money(income, currency)}, una distribución 50/30/20 reservaría ${money(savings, currency)} para ahorro, inversión o pago de deuda.`;
    saveHistory('budget', `${money(income, currency)}/mes → ${money(savings, currency)} ahorro`);
  });

  attachSubmit('[data-calculator="savings"]', 'savings', () => {
    const goal = getNum('savings-goal');
    const current = getNum('savings-current');
    const monthly = getNum('savings-monthly');
    const annualRate = getNum('savings-rate') / 100;
    const currency = q('#savings-currency').value || 'USD';

    let balance = current;
    let months = 0;
    const monthlyRate = annualRate / 12;
    while(balance < goal && months < 1200){
      balance = balance * (1 + monthlyRate) + monthly;
      months += 1;
    }

    const years = months / 12;
    const savedOnly = current + monthly * months;
    const interest = Math.max(0, balance - savedOnly);
    const progress = Math.min(100, Math.max(3, (current / Math.max(goal,1)) * 100));

    q('#savings-result').classList.remove('hide');
    q('#savings-main').textContent = `${number(months)} meses`;
    q('#savings-time').innerHTML = `<strong>${number(years, 1)} años</strong><span>Tiempo estimado</span>`;
    q('#savings-interest').innerHTML = `<strong>${money(interest, currency)}</strong><span>Interés aproximado ganado</span>`;
    q('#savings-final').innerHTML = `<strong>${money(balance, currency)}</strong><span>Saldo estimado al llegar</span>`;
    q('#savings-progress span').style.width = `${progress}%`;
    q('#savings-note').textContent = `Ahorrando ${money(monthly, currency)} al mes, tardarías cerca de ${number(months)} meses en alcanzar ${money(goal, currency)} desde un punto de partida de ${money(current, currency)}.`;
    saveHistory('savings', `${money(goal, currency)} en ${number(months)} meses`);
  });
})();
