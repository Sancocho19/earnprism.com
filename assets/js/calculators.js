
(function(){
  const $ = (selector) => document.querySelector(selector);

  function n(id){
    const value = parseFloat((document.getElementById(id)?.value || '0').replace?.(',', '.') ?? '0');
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
    container.innerHTML = items.map(item => (
      `<div class="link-card"><strong>${item.summary}</strong><small>${item.date}</small></div>`
    )).join('');
  }

  function attachSubmit(selector, toolName, callback){
    const form = document.querySelector(selector);
    if(!form) return;
    renderHistory(toolName);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      callback(form);
    });
    form.addEventListener('reset', () => {
      setTimeout(() => {
        document.querySelectorAll('.result-card').forEach(el => {
          if(el.id.startsWith(toolName)) el.classList.add('hide');
        });
      }, 0);
    });
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
    $('#budget-note').textContent = `If monthly take-home income is ${money(income, curr)}, a 50/30/20 split sets aside about ${money(savings, curr)} for saving, investing, or extra debt payoff.`;
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
    const progress = Math.min(100, Math.max(3, (current / Math.max(goal, 1)) * 100));

    $('#savings-result')?.classList.remove('hide');
    $('#savings-main').textContent = `${number(months)} months`;
    $('#savings-time').innerHTML = `<strong>${number(years, 1)} years</strong><span>Estimated timeline</span>`;
    $('#savings-interest').innerHTML = `<strong>${money(interest, curr)}</strong><span>Estimated interest earned</span>`;
    $('#savings-final').innerHTML = `<strong>${money(balance, curr)}</strong><span>Estimated balance at the target point</span>`;
    $('#savings-progress span').style.width = `${progress}%`;
    $('#savings-note').textContent = `With ${money(current, curr)} already saved and ${money(monthly, curr)} added each month, the goal of ${money(goal, curr)} could take about ${number(months)} months under the assumptions you entered.`;
    saveHistory('savings', `${money(goal, curr)} goal ≈ ${number(months)} months`);
  });

  attachSubmit('[data-calculator="emergency"]', 'emergency', () => {
    const expenses = n('emergency-expenses');
    const current = n('emergency-current');
    const monthly = n('emergency-monthly');
    const curr = currency('emergency-currency');

    const oneMonth = expenses;
    const threeMonth = expenses * 3;
    const sixMonth = expenses * 6;
    const monthsToThree = Math.max(0, Math.ceil((threeMonth - current) / Math.max(1, monthly)));

    $('#emergency-result')?.classList.remove('hide');
    $('#emergency-main').textContent = money(oneMonth, curr);
    $('#emergency-three').innerHTML = `<strong>${money(threeMonth, curr)}</strong><span>Three-month target</span>`;
    $('#emergency-six').innerHTML = `<strong>${money(sixMonth, curr)}</strong><span>Six-month target</span>`;
    $('#emergency-time').innerHTML = `<strong>${number(monthsToThree)} months</strong><span>Approx. time to the three-month target</span>`;
    $('#emergency-note').textContent = `If essential monthly expenses are ${money(expenses, curr)}, one month is ${money(oneMonth, curr)}, three months is ${money(threeMonth, curr)}, and six months is ${money(sixMonth, curr)}.`;
    saveHistory('emergency', `3-month fund ${money(threeMonth, curr)}`);
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
      if(payment <= interest){
        break;
      }
    }
    const impossible = payment <= balance * monthlyRate;
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
    $('#debt-total').innerHTML = `<strong>${money(balance + interestPaid, curr)}</strong><span>Total paid over time</span>`;
    $('#debt-faster').innerHTML = `<strong>${number(monthsSaved)} months</strong><span>Months saved by paying ${money(fasterPayment, curr)} instead</span>`;
    $('#debt-note').textContent = impossible
      ? `The monthly payment is too close to the monthly interest to pay the balance down effectively.`
      : `With a payment of ${money(payment, curr)} per month at ${number(apr*100,1)}% APR, the debt could take around ${number(months)} months to clear.`;
    saveHistory('debt', `${money(balance, curr)} debt ≈ ${impossible ? 'too low' : number(months)+' months'}`);
  });

  attachSubmit('[data-calculator="sidehustle"]', 'sidehustle', () => {
    const revenue = n('sidehustle-revenue');
    const fees = n('sidehustle-fees') / 100;
    const tax = n('sidehustle-tax') / 100;
    const costs = n('sidehustle-costs');
    const curr = currency('sidehustle-currency');
    const afterFees = revenue * (1 - fees);
    const taxReserve = afterFees * tax;
    const profit = afterFees - taxReserve - costs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    $('#sidehustle-result')?.classList.remove('hide');
    $('#sidehustle-main').textContent = money(profit, curr);
    $('#sidehustle-afterfees').innerHTML = `<strong>${money(afterFees, curr)}</strong><span>Revenue after fees</span>`;
    $('#sidehustle-taxreserve').innerHTML = `<strong>${money(taxReserve, curr)}</strong><span>Suggested tax reserve</span>`;
    $('#sidehustle-margin').innerHTML = `<strong>${number(margin,1)}%</strong><span>Estimated profit margin</span>`;
    $('#sidehustle-note').textContent = `With ${money(revenue, curr)} in revenue, the assumptions entered leave an estimated profit of ${money(profit, curr)} for the month.`;
    saveHistory('sidehustle', `${money(profit, curr)} monthly profit`);
  });
})();
