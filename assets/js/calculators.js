
(function(){
  const $ = (selector) => document.querySelector(selector);

  function n(id){
    const raw = document.getElementById(id)?.value ?? '0';
    const value = parseFloat(String(raw).replace(',', '.'));
    return Number.isFinite(value) ? value : 0;
  }

  function currency(id, fallback='USD'){
    return document.getElementById(id)?.value || fallback;
  }

  function money(value, curr='USD'){
    try{
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
        maximumFractionDigits: Math.abs(value) < 100 ? 2 : 0
      }).format(value);
    }catch(err){
      return `${curr} ${Number(value || 0).toFixed(2)}`;
    }
  }

  function number(value, digits=0){
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits
    }).format(value);
  }

  function saveHistory(tool, summary){
    const key = `earnprism_history_${tool}`;
    let items = [];
    try{ items = JSON.parse(localStorage.getItem(key) || '[]'); }catch(err){}
    items.unshift({date:new Date().toLocaleString('en-US'), summary});
    items = items.slice(0, 6);
    localStorage.setItem(key, JSON.stringify(items));
    renderHistory(tool);
  }

  function renderHistory(tool){
    const container = document.querySelector(`[data-history="${tool}"]`);
    if(!container) return;
    let items = [];
    try{ items = JSON.parse(localStorage.getItem(`earnprism_history_${tool}`) || '[]'); }catch(err){}
    if(!items.length){
      container.innerHTML = '<p class="muted">Your recent results will appear here on this browser.</p>';
      return;
    }
    container.innerHTML = items.map(item => `<div class="link-card"><strong>${item.summary}</strong><small>${item.date}</small></div>`).join('');
  }

  function attachSubmit(selector, toolName, callback){
    const form = document.querySelector(selector);
    if(!form) return;
    renderHistory(toolName);
    form.addEventListener('submit', (e) => { e.preventDefault(); callback(form); });
  }

  attachSubmit('[data-calculator="salary"]', 'salary', () => {
    const hourly = n('salary-hourly');
    const hours = n('salary-hours');
    const weeks = n('salary-weeks');
    const curr = currency('salary-currency');
    const weekly = hourly * hours;
    const monthly = (weekly * weeks) / 12;
    const annual = weekly * weeks;
    const daily = hourly * (hours / 5);
    $('#salary-result')?.classList.remove('hide');
    $('#salary-main').textContent = money(monthly, curr);
    $('#salary-weekly').innerHTML = `<strong>${money(weekly, curr)}</strong><span>Per week</span>`;
    $('#salary-annual').innerHTML = `<strong>${money(annual, curr)}</strong><span>Per year</span>`;
    $('#salary-daily').innerHTML = `<strong>${money(daily, curr)}</strong><span>Per work day</span>`;
    $('#salary-note').textContent = `At ${money(hourly, curr)} per hour, ${number(hours)} hours a week, and ${number(weeks)} paid weeks a year, monthly income is roughly ${money(monthly, curr)}.`;
    saveHistory('salary', `${money(hourly, curr)}/hr ≈ ${money(monthly, curr)}/month`);
  });

  attachSubmit('[data-calculator="salaryhourly"]', 'salaryhourly', () => {
    const annual = n('salaryhourly-annual');
    const hours = Math.max(1, n('salaryhourly-hours'));
    const weeks = Math.max(1, n('salaryhourly-weeks'));
    const curr = currency('salaryhourly-currency');
    const hourly = annual / (hours * weeks);
    const weekly = annual / weeks;
    const monthly = annual / 12;
    const daily = hourly * (hours / 5);
    $('#salaryhourly-result')?.classList.remove('hide');
    $('#salaryhourly-main').textContent = money(hourly, curr);
    $('#salaryhourly-weekly').innerHTML = `<strong>${money(weekly, curr)}</strong><span>Per week</span>`;
    $('#salaryhourly-monthly').innerHTML = `<strong>${money(monthly, curr)}</strong><span>Per month</span>`;
    $('#salaryhourly-daily').innerHTML = `<strong>${money(daily, curr)}</strong><span>Per work day</span>`;
    $('#salaryhourly-note').textContent = `An annual salary of ${money(annual, curr)} works out to about ${money(hourly, curr)} per hour with ${number(hours)} hours a week across ${number(weeks)} paid weeks.`;
    saveHistory('salaryhourly', `${money(annual, curr)}/year ≈ ${money(hourly, curr)}/hr`);
  });

  attachSubmit('[data-calculator="overtime"]', 'overtime', () => {
    const rate = n('overtime-hourly');
    const hours = n('overtime-hours');
    const threshold = n('overtime-threshold');
    const mult = Math.max(1, n('overtime-multiplier'));
    const curr = currency('overtime-currency');
    const regularHours = Math.min(hours, threshold);
    const overtimeHours = Math.max(0, hours - threshold);
    const regularPay = regularHours * rate;
    const overtimePay = overtimeHours * rate * mult;
    const total = regularPay + overtimePay;
    $('#overtime-result')?.classList.remove('hide');
    $('#overtime-main').textContent = money(total, curr);
    $('#overtime-regular').innerHTML = `<strong>${money(regularPay, curr)}</strong><span>Regular pay</span>`;
    $('#overtime-extra').innerHTML = `<strong>${money(overtimePay, curr)}</strong><span>Overtime pay</span>`;
    $('#overtime-overtimehours').innerHTML = `<strong>${number(overtimeHours,1)} hours</strong><span>Hours paid at overtime rate</span>`;
    $('#overtime-note').textContent = `With ${number(hours,1)} total hours and overtime after ${number(threshold,1)} hours, the extra pay is roughly ${money(overtimePay, curr)} this week.`;
    saveHistory('overtime', `${number(overtimeHours,1)} OT hrs ≈ ${money(overtimePay, curr)}`);
  });

  attachSubmit('[data-calculator="raise"]', 'raise', () => {
    const current = n('raise-current');
    const increase = n('raise-percent') / 100;
    const tax = n('raise-tax') / 100;
    const inflation = n('raise-inflation') / 100;
    const curr = currency('raise-currency');
    const newSalary = current * (1 + increase);
    const diff = newSalary - current;
    const afterTax = diff * (1 - tax);
    const realGainPct = ((1 + increase) / (1 + inflation) - 1) * 100;
    const monthlyNet = afterTax / 12;
    $('#raise-result')?.classList.remove('hide');
    $('#raise-main').textContent = `${number(realGainPct, 2)}%`;
    $('#raise-gross').innerHTML = `<strong>${money(diff, curr)}</strong><span>Gross annual raise</span>`;
    $('#raise-net').innerHTML = `<strong>${money(afterTax, curr)}</strong><span>Annual raise after estimated tax</span>`;
    $('#raise-month').innerHTML = `<strong>${money(monthlyNet, curr)}</strong><span>Approx. monthly impact</span>`;
    $('#raise-note').textContent = `Your estimated new salary is ${money(newSalary, curr)}. After estimated tax and inflation, the purchasing-power gain is about ${number(realGainPct, 2)}%.`;
    saveHistory('raise', `${number(realGainPct,2)}% real gain | +${money(monthlyNet, curr)}/mo`);
  });

  attachSubmit('[data-calculator="freelance"]', 'freelance', () => {
    const target = n('freelance-target');
    const taxes = n('freelance-taxes') / 100;
    const overhead = n('freelance-overhead') / 100;
    const billableHours = Math.max(1, n('freelance-hours'));
    const weeks = Math.max(1, n('freelance-weeks'));
    const curr = currency('freelance-currency');
    const keepRate = Math.max(0.05, 1 - taxes - overhead);
    const grossNeeded = target / keepRate;
    const yearlyHours = billableHours * weeks;
    const hourlyRate = grossNeeded / yearlyHours;
    const dailyRate = hourlyRate * 6;
    const projectBase = hourlyRate * 20;
    $('#freelance-result')?.classList.remove('hide');
    $('#freelance-main').textContent = money(hourlyRate, curr);
    $('#freelance-hour').innerHTML = `<strong>${money(hourlyRate, curr)}</strong><span>Suggested hourly floor</span>`;
    $('#freelance-day').innerHTML = `<strong>${money(dailyRate, curr)}</strong><span>Approx. 6-hour day rate</span>`;
    $('#freelance-project').innerHTML = `<strong>${money(projectBase, curr)}</strong><span>Base for a 20-hour project</span>`;
    $('#freelance-note').textContent = `To keep roughly ${money(target, curr)} per year after the assumptions you entered, the work needs to average about ${money(hourlyRate, curr)} per billable hour.`;
    saveHistory('freelance', `${money(hourlyRate, curr)}/hr for ${money(target, curr)} target`);
  });

  attachSubmit('[data-calculator="projectquote"]', 'projectquote', () => {
    const rate = n('projectquote-rate');
    const hours = n('projectquote-hours');
    const buffer = n('projectquote-buffer') / 100;
    const expenses = n('projectquote-expenses');
    const revisions = n('projectquote-revisions');
    const curr = currency('projectquote-currency');
    const base = rate * hours;
    const buffered = base * (1 + buffer) + expenses;
    const deposit = buffered * 0.4;
    $('#projectquote-result')?.classList.remove('hide');
    $('#projectquote-main').textContent = money(buffered, curr);
    $('#projectquote-base').innerHTML = `<strong>${money(base, curr)}</strong><span>Base labor estimate</span>`;
    $('#projectquote-buffered').innerHTML = `<strong>${money(buffered, curr)}</strong><span>Quote with buffer and expenses</span>`;
    $('#projectquote-deposit').innerHTML = `<strong>${money(deposit, curr)}</strong><span>Example 40% deposit</span>`;
    $('#projectquote-note').textContent = `At ${money(rate, curr)} per hour for ${number(hours)} hours, plus a ${number(buffer*100)}% buffer, ${number(revisions)} revision rounds, and ${money(expenses, curr)} in expenses, the quote lands near ${money(buffered, curr)}.`;
    saveHistory('projectquote', `${money(buffered, curr)} quote`);
  });

  attachSubmit('[data-calculator="creator"]', 'creator', () => {
    const followers = n('creator-followers');
    const engagement = n('creator-engagement') / 100;
    const conversion = n('creator-conversion') / 100;
    const price = n('creator-price');
    const sponsorCpm = n('creator-sponsor-cpm');
    const posts = n('creator-posts');
    const curr = currency('creator-currency');
    const engagedAudience = followers * engagement;
    const sponsorBase = (followers / 1000) * sponsorCpm * Math.max(0.7, engagement * 20);
    const sponsorLow = sponsorBase * posts * 0.8;
    const sponsorHigh = sponsorBase * posts * 1.25;
    const productSales = engagedAudience * conversion;
    const productRevenue = productSales * price;
    const combined = ((sponsorLow + sponsorHigh) / 2) + productRevenue;
    const progress = Math.min(100, Math.max(4, engagement * 1400));
    $('#creator-result')?.classList.remove('hide');
    $('#creator-main').textContent = money(combined, curr);
    $('#creator-sponsor').innerHTML = `<strong>${money(sponsorLow, curr)} – ${money(sponsorHigh, curr)}</strong><span>Estimated sponsorship range</span>`;
    $('#creator-product').innerHTML = `<strong>${money(productRevenue, curr)}</strong><span>Potential offer revenue</span>`;
    $('#creator-engaged').innerHTML = `<strong>${number(engagedAudience)}</strong><span>Approx. engaged audience</span>`;
    $('#creator-progress span').style.width = `${progress}%`;
    $('#creator-note').textContent = `This is a planning model, not an income promise. It helps convert audience, engagement, and offers into a rough monthly range.`;
    saveHistory('creator', `${number(followers)} audience ≈ ${money(combined, curr)}/mo`);
  });

  attachSubmit('[data-calculator="budget"]', 'budget', () => {
    const income = n('budget-income');
    const curr = currency('budget-currency');
    const needs = income * 0.5;
    const wants = income * 0.3;
    const savings = income * 0.2;
    $('#budget-result')?.classList.remove('hide');
    $('#budget-main').textContent = money(savings, curr);
    $('#budget-needs').innerHTML = `<strong>${money(needs, curr)}</strong><span>Needs</span>`;
    $('#budget-wants').innerHTML = `<strong>${money(wants, curr)}</strong><span>Wants</span>`;
    $('#budget-savings').innerHTML = `<strong>${money(savings, curr)}</strong><span>Savings or extra debt payoff</span>`;
    $('#budget-needs-bar').textContent = `${number(needs / Math.max(1, income) * 100)}%`;
    $('#budget-wants-bar').textContent = `${number(wants / Math.max(1, income) * 100)}%`;
    $('#budget-savings-bar').textContent = `${number(savings / Math.max(1, income) * 100)}%`;
    $('#budget-note').textContent = `If monthly take-home income is ${money(income, curr)}, a 50/30/20 split suggests about ${money(savings, curr)} for saving, investing, or extra debt payoff.`;
    saveHistory('budget', `${money(income, curr)}/mo → ${money(savings, curr)} savings`);
  });

  attachSubmit('[data-calculator="savings"]', 'savings', () => {
    const goal = n('savings-goal');
    const current = n('savings-current');
    const monthly = n('savings-monthly');
    const annualRate = n('savings-rate') / 100;
    const curr = currency('savings-currency');
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
    $('#savings-result')?.classList.remove('hide');
    $('#savings-main').textContent = `${number(months)} months`;
    $('#savings-balance').innerHTML = `<strong>${money(balance, curr)}</strong><span>Estimated balance at goal point</span>`;
    $('#savings-years').innerHTML = `<strong>${number(years, 1)} years</strong><span>Estimated timeline</span>`;
    $('#savings-needed').innerHTML = `<strong>${money(interest, curr)}</strong><span>Estimated interest earned</span>`;
    $('#savings-note').textContent = `With ${money(current, curr)} already saved and ${money(monthly, curr)} added each month, the goal of ${money(goal, curr)} could take about ${number(months)} months under the assumptions you entered.`;
    saveHistory('savings', `${money(goal, curr)} goal ≈ ${number(months)} months`);
  });

  attachSubmit('[data-calculator="emergency"]', 'emergency', () => {
    const expenses = n('emergency-expenses');
    const months = n('emergency-months');
    const current = n('emergency-current');
    const monthly = n('emergency-monthly');
    const curr = currency('emergency-currency');
    const target = expenses * months;
    const gap = Math.max(0, target - current);
    const time = monthly > 0 ? Math.ceil(gap / monthly) : 0;
    $('#emergency-result')?.classList.remove('hide');
    $('#emergency-main').textContent = money(target, curr);
    $('#emergency-gap').innerHTML = `<strong>${money(gap, curr)}</strong><span>Amount left to save</span>`;
    $('#emergency-monthlycard').innerHTML = `<strong>${money(monthly, curr)}</strong><span>Monthly contribution</span>`;
    $('#emergency-time').innerHTML = `<strong>${number(time)} months</strong><span>Estimated time to target</span>`;
    $('#emergency-note').textContent = `At ${money(expenses, curr)} in core monthly expenses, a ${number(months)}-month emergency fund target is about ${money(target, curr)}.`;
    saveHistory('emergency', `${number(months)}-month fund ${money(target, curr)}`);
  });

  attachSubmit('[data-calculator="debt"]', 'debt', () => {
    const balance = n('debt-balance');
    const apr = n('debt-apr') / 100;
    const payment = n('debt-payment');
    const curr = currency('debt-currency');
    const monthlyRate = apr / 12;
    let months = 0;
    let current = balance;
    let interestPaid = 0;
    while(current > 0.01 && months < 1200){
      const interest = current * monthlyRate;
      interestPaid += interest;
      current = current + interest - payment;
      months += 1;
      if(payment <= interest){ break; }
    }
    const impossible = payment <= balance * monthlyRate;
    const totalPaid = balance + interestPaid;
    const fasterPayment = payment + 100;
    let altMonths = 0, altCurrent = balance;
    while(altCurrent > 0.01 && altMonths < 1200){
      const interest = altCurrent * monthlyRate;
      altCurrent = altCurrent + interest - fasterPayment;
      altMonths += 1;
      if(fasterPayment <= interest){ break; }
    }
    const monthsSaved = Math.max(0, months - altMonths);
    $('#debt-result')?.classList.remove('hide');
    $('#debt-main').textContent = impossible ? 'Payment too low' : `${number(months)} months`;
    $('#debt-interest').innerHTML = `<strong>${money(interestPaid, curr)}</strong><span>Estimated interest paid</span>`;
    $('#debt-total').innerHTML = `<strong>${money(totalPaid, curr)}</strong><span>Total paid over time</span>`;
    $('#debt-pace').innerHTML = `<strong>${number(monthsSaved)} months</strong><span>Months saved by paying ${money(fasterPayment, curr)} instead</span>`;
    $('#debt-note').textContent = impossible ? `The monthly payment is too close to the monthly interest to shrink the balance effectively.` : `With a payment of ${money(payment, curr)} per month at ${number(apr*100,1)}% APR, the debt could take around ${number(months)} months to clear.`;
    saveHistory('debt', `${money(balance, curr)} debt ≈ ${impossible ? 'too low' : number(months)+' months'}`);
  });

  attachSubmit('[data-calculator="sidehustle"]', 'sidehustle', () => {
    const revenue = n('sidehustle-income');
    const fees = n('sidehustle-fees') / 100;
    const tax = n('sidehustle-tax') / 100;
    const costs = n('sidehustle-expenses');
    const curr = currency('sidehustle-currency');
    const feeAmount = revenue * fees;
    const afterFees = revenue - feeAmount;
    const taxReserve = Math.max(0, afterFees * tax);
    const profit = afterFees - taxReserve - costs;
    $('#sidehustle-result')?.classList.remove('hide');
    $('#sidehustle-main').textContent = money(profit, curr);
    $('#sidehustle-feecard').innerHTML = `<strong>${money(feeAmount, curr)}</strong><span>Estimated fees</span>`;
    $('#sidehustle-taxcard').innerHTML = `<strong>${money(taxReserve, curr)}</strong><span>Suggested tax reserve</span>`;
    $('#sidehustle-net').innerHTML = `<strong>${money(afterFees - costs, curr)}</strong><span>After fees and recurring costs</span>`;
    $('#sidehustle-note').textContent = `With ${money(revenue, curr)} in gross monthly revenue, the assumptions entered leave an estimated profit of ${money(profit, curr)}.`;
    saveHistory('sidehustle', `${money(profit, curr)} monthly profit`);
  });

  attachSubmit('[data-calculator="takehome"]', 'takehome', () => {
    const salary = n('takehome-salary');
    const tax = n('takehome-tax') / 100;
    const deductions = n('takehome-deductions');
    const curr = currency('takehome-currency');
    const annualNet = salary * (1 - tax) - deductions;
    const monthlyNet = annualNet / 12;
    const biweekly = annualNet / 26;
    $('#takehome-result')?.classList.remove('hide');
    $('#takehome-main').textContent = money(monthlyNet, curr);
    $('#takehome-annual').innerHTML = `<strong>${money(annualNet, curr)}</strong><span>Estimated annual take-home</span>`;
    $('#takehome-biweekly').innerHTML = `<strong>${money(biweekly, curr)}</strong><span>Estimated biweekly take-home</span>`;
    $('#takehome-deductioncard').innerHTML = `<strong>${money(deductions, curr)}</strong><span>Annual deductions entered</span>`;
    $('#takehome-note').textContent = `From a gross annual salary of ${money(salary, curr)}, the assumptions entered suggest about ${money(monthlyNet, curr)} per month in take-home pay.`;
    saveHistory('takehome', `${money(monthlyNet, curr)}/month take-home`);
  });

  attachSubmit('[data-calculator="compound"]', 'compound', () => {
    const start = n('compound-start');
    const monthly = n('compound-monthly');
    const rate = n('compound-rate') / 100;
    const years = Math.max(1, n('compound-years'));
    const curr = currency('compound-currency');
    let balance = start;
    const monthlyRate = rate / 12;
    const months = years * 12;
    for(let i=0;i<months;i++){
      balance = balance * (1 + monthlyRate) + monthly;
    }
    const contributions = start + monthly * months;
    const growth = balance - contributions;
    $('#compound-result')?.classList.remove('hide');
    $('#compound-main').textContent = money(balance, curr);
    $('#compound-contrib').innerHTML = `<strong>${money(contributions, curr)}</strong><span>Total contributed</span>`;
    $('#compound-growth').innerHTML = `<strong>${money(growth, curr)}</strong><span>Estimated growth</span>`;
    $('#compound-end').innerHTML = `<strong>${number(years)} years</strong><span>Projection period</span>`;
    $('#compound-note').textContent = `With a starting balance of ${money(start, curr)} and ${money(monthly, curr)} added each month for ${number(years)} years, the ending value could be about ${money(balance, curr)} under the assumptions entered.`;
    saveHistory('compound', `${money(balance, curr)} in ${number(years)}y`);
  });

  attachSubmit('[data-calculator="networth"]', 'networth', () => {
    const cash = n('networth-cash');
    const investments = n('networth-investments');
    const other = n('networth-otherassets');
    const debts = n('networth-debts');
    const curr = currency('networth-currency');
    const assets = cash + investments + other;
    const worth = assets - debts;
    $('#networth-result')?.classList.remove('hide');
    $('#networth-main').textContent = money(worth, curr);
    $('#networth-assets').innerHTML = `<strong>${money(assets, curr)}</strong><span>Total assets</span>`;
    $('#networth-debtcard').innerHTML = `<strong>${money(debts, curr)}</strong><span>Total debts</span>`;
    $('#networth-cashcard').innerHTML = `<strong>${money(cash, curr)}</strong><span>Cash and savings entered</span>`;
    $('#networth-note').textContent = `With ${money(assets, curr)} in total assets and ${money(debts, curr)} in debts, estimated net worth is ${money(worth, curr)}.`;
    saveHistory('networth', `${money(worth, curr)} net worth`);
  });

  attachSubmit('[data-calculator="dti"]', 'dti', () => {
    const debt = n('dti-debt');
    const income = Math.max(1, n('dti-income'));
    const curr = currency('dti-currency');
    const ratio = (debt / income) * 100;
    const room = income - debt;
    $('#dti-result')?.classList.remove('hide');
    $('#dti-main').textContent = `${number(ratio, 1)}%`;
    $('#dti-debtcard').innerHTML = `<strong>${money(debt, curr)}</strong><span>Monthly debt payments</span>`;
    $('#dti-incomecard').innerHTML = `<strong>${money(income, curr)}</strong><span>Gross monthly income</span>`;
    $('#dti-room').innerHTML = `<strong>${money(room, curr)}</strong><span>Gross income left before non-debt costs</span>`;
    $('#dti-note').textContent = `With ${money(debt, curr)} in monthly debt payments against ${money(income, curr)} in gross monthly income, the debt-to-income ratio is about ${number(ratio,1)}%.`;
    saveHistory('dti', `${number(ratio,1)}% DTI`);
  });
})();
