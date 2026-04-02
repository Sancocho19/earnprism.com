
(function(){
  const q = (selector) => document.querySelector(selector);

  function getNum(id){
    const value = parseFloat(document.getElementById(id).value || '0');
    return Number.isFinite(value) ? value : 0;
  }

  function money(n, currency='USD'){
    try{
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: n < 100 ? 2 : 0
      }).format(n);
    }catch(err){
      return `${currency} ${Math.round(n).toLocaleString('en-US')}`;
    }
  }

  function number(n, digits=0){
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits
    }).format(n);
  }

  function saveHistory(tool, summary){
    const key = `incomegrid_history_${tool}`;
    let items = [];
    try{
      items = JSON.parse(localStorage.getItem(key) || '[]');
    }catch(err){}
    items.unshift({ date: new Date().toLocaleString('en-US'), summary });
    items = items.slice(0, 6);
    localStorage.setItem(key, JSON.stringify(items));
    renderHistory(tool);
  }

  function renderHistory(tool){
    const container = document.querySelector(`[data-history="${tool}"]`);
    if(!container) return;
    let items = [];
    try{
      items = JSON.parse(localStorage.getItem(`incomegrid_history_${tool}`) || '[]');
    }catch(err){}
    if(!items.length){
      container.innerHTML = '<p class="muted">Your last results will appear here on this browser.</p>';
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
    q('#salary-weekly').innerHTML = `<strong>${money(weekly, currency)}</strong><span>Per week</span>`;
    q('#salary-annual').innerHTML = `<strong>${money(annual, currency)}</strong><span>Per year</span>`;
    q('#salary-daily').innerHTML = `<strong>${money(daily, currency)}</strong><span>Per work day</span>`;
    q('#salary-note').textContent = `With ${number(hours)} hours per week and ${number(weeks)} paid weeks per year, your estimated monthly income would be ${money(monthly, currency)}.`;
    saveHistory('salary', `${money(hourly, currency)}/hr ≈ ${money(monthly, currency)}/month`);
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
    q('#freelance-hour').innerHTML = `<strong>${money(hourlyRate, currency)}</strong><span>Suggested hourly floor</span>`;
    q('#freelance-day').innerHTML = `<strong>${money(dailyRate, currency)}</strong><span>Approx. 6-hour day rate</span>`;
    q('#freelance-project').innerHTML = `<strong>${money(projectBase, currency)}</strong><span>Base for a 20-hour project</span>`;
    q('#freelance-note').textContent = `To keep ${money(target, currency)} per year after taxes and overhead, you would need to charge about ${money(hourlyRate, currency)} per billable hour.`;
    saveHistory('freelance', `${money(hourlyRate, currency)}/hour for ${money(target, currency)} target`);
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
    q('#creator-sponsor').innerHTML = `<strong>${money(sponsorLow, currency)} – ${money(sponsorHigh, currency)}</strong><span>Estimated monthly sponsorship range</span>`;
    q('#creator-product').innerHTML = `<strong>${money(productRevenue, currency)}</strong><span>Potential product or community revenue</span>`;
    q('#creator-engaged').innerHTML = `<strong>${number(engagedAudience)}</strong><span>Approx. engaged audience</span>`;
    q('#creator-progress span').style.width = `${progress}%`;
    q('#creator-note').textContent = `This is not an income promise. It is a planning model that converts followers, engagement, and offers into a more useful range.`;
    saveHistory('creator', `${number(followers)} followers ≈ ${money(combined, currency)}/month`);
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
    q('#raise-gross').innerHTML = `<strong>${money(diff, currency)}</strong><span>Gross annual raise</span>`;
    q('#raise-net').innerHTML = `<strong>${money(afterTax, currency)}</strong><span>Annual raise after tax</span>`;
    q('#raise-month').innerHTML = `<strong>${money(monthlyNet, currency)}</strong><span>Approx. net monthly impact</span>`;
    q('#raise-note').textContent = `Your new salary would be ${money(newSalary, currency)} per year. After inflation, your real gain is about ${number(realGainPct, 2)}%.`;
    saveHistory('raise', `Real raise ${number(realGainPct,2)}% | +${money(monthlyNet, currency)}/month`);
  });

  attachSubmit('[data-calculator="budget"]', 'budget', () => {
    const income = getNum('budget-income');
    const currency = q('#budget-currency').value || 'USD';
    const needs = income * 0.5;
    const wants = income * 0.3;
    const savings = income * 0.2;

    q('#budget-result').classList.remove('hide');
    q('#budget-main').textContent = money(savings, currency);
    q('#budget-needs').innerHTML = `<strong>${money(needs, currency)}</strong><span>Needs</span>`;
    q('#budget-wants').innerHTML = `<strong>${money(wants, currency)}</strong><span>Wants</span>`;
    q('#budget-savings').innerHTML = `<strong>${money(savings, currency)}</strong><span>Savings or extra debt payoff</span>`;
    q('#budget-needs-bar').style.width = '50%';
    q('#budget-wants-bar').style.width = '30%';
    q('#budget-savings-bar').style.width = '20%';
    q('#budget-note').textContent = `If your monthly take-home income is ${money(income, currency)}, a 50/30/20 split would reserve ${money(savings, currency)} for saving, investing, or faster debt payoff.`;
    saveHistory('budget', `${money(income, currency)}/month → ${money(savings, currency)} savings`);
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
    q('#savings-main').textContent = `${number(months)} months`;
    q('#savings-time').innerHTML = `<strong>${number(years, 1)} years</strong><span>Estimated timeline</span>`;
    q('#savings-interest').innerHTML = `<strong>${money(interest, currency)}</strong><span>Estimated interest earned</span>`;
    q('#savings-final').innerHTML = `<strong>${money(balance, currency)}</strong><span>Estimated balance at the target point</span>`;
    q('#savings-progress span').style.width = `${progress}%`;
    q('#savings-note').textContent = `Saving ${money(monthly, currency)} each month, you would take about ${number(months)} months to reach ${money(goal, currency)} starting from ${money(current, currency)}.`;
    saveHistory('savings', `${money(goal, currency)} in ${number(months)} months`);
  });
})();
