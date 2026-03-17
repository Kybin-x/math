/* ========================================
   高职高考数学学习网站 - 全局交互逻辑
   ======================================== */

document.addEventListener('DOMContentLoaded', function () {

    // ========== 1. 阅读进度条 ==========
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        window.addEventListener('scroll', function () {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = percent + '%';
        });
    }

    // ========== 2. 解题步骤折叠/展开 ==========
    document.querySelectorAll('.step-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const detail = this.closest('.example-block').querySelector('.step-detail');
            if (!detail) return;
            const isOpen = detail.classList.contains('open');
            detail.classList.toggle('open');
            this.textContent = isOpen ? '👀 查看解题步骤' : '🙈 收起步骤';
        });
    });

    // ========== 3. 小测验系统 ==========
    initQuiz();

    // ========== 4. 入场动画（滚动触发） ==========
    initScrollAnimation();

    // ========== 5. 知识点导航高亮 ==========
    initSectionNavHighlight();
});

/* ---------- 小测验逻辑 ---------- */
function initQuiz() {
    const quizCards = document.querySelectorAll('.quiz-card');
    if (quizCards.length === 0) return;

    let totalQuestions = quizCards.length;
    let answeredCount = 0;
    let correctCount = 0;

    quizCards.forEach(function (card) {
        const options = card.querySelectorAll('.quiz-option');
        const explanation = card.querySelector('.quiz-explanation');

        options.forEach(function (option) {
            option.addEventListener('click', function () {
                // 防止重复作答
                if (card.classList.contains('answered')) return;
                card.classList.add('answered');
                answeredCount++;

                const isCorrect = this.dataset.correct === 'true';

                // 禁用所有选项
                options.forEach(function (opt) {
                    opt.disabled = true;
                    if (opt.dataset.correct === 'true') {
                        opt.classList.add('correct');
                    }
                });

                if (isCorrect) {
                    correctCount++;
                    this.classList.add('correct');
                } else {
                    this.classList.add('wrong');
                }

                // 显示解析
                if (explanation) {
                    explanation.classList.add('show');
                }

                // 添加反馈动画
                card.style.transition = 'transform 0.2s';
                card.style.transform = 'scale(0.98)';
                setTimeout(function () {
                    card.style.transform = 'scale(1)';
                }, 200);

                // 检查是否全部答完
                if (answeredCount === totalQuestions) {
                    setTimeout(showQuizResult, 600);
                }
            });
        });
    });

    function showQuizResult() {
        const resultBox = document.querySelector('.quiz-result');
        if (!resultBox) return;

        const scoreEl = resultBox.querySelector('.score');
        const scoreTextEl = resultBox.querySelector('.score-text');
        const encourageEl = resultBox.querySelector('.encouragement');

        const percent = Math.round((correctCount / totalQuestions) * 100);

        scoreEl.textContent = correctCount + ' / ' + totalQuestions;
        scoreTextEl.textContent = '正确率：' + percent + '%';

        if (percent === 100) {
            encourageEl.textContent = '🎉 太厉害了！全部正确！你是数学小天才！';
            encourageEl.style.color = '#2ECC71';
        } else if (percent >= 80) {
            encourageEl.textContent = '👏 非常棒！掌握得很好，继续保持！';
            encourageEl.style.color = '#27AE60';
        } else if (percent >= 60) {
            encourageEl.textContent = '💪 还不错！再复习一下错题会更好哦~';
            encourageEl.style.color = '#F39C12';
        } else if (percent >= 40) {
            encourageEl.textContent = '📖 别灰心！回去看看知识点，再来一次吧~';
            encourageEl.style.color = '#E67E22';
        } else {
            encourageEl.textContent = '🤗 没关系！学习就是不断进步的过程，加油！';
            encourageEl.style.color = '#E74C3C';
        }

        resultBox.classList.add('show');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 数字跳动动画
        animateScore(scoreEl, correctCount, totalQuestions);
    }

    function animateScore(el, target, total) {
        let current = 0;
        const duration = 800;
        const step = duration / (target || 1);

        if (target === 0) {
            el.textContent = '0 / ' + total;
            return;
        }

        const timer = setInterval(function () {
            current++;
            el.textContent = current + ' / ' + total;
            if (current >= target) {
                clearInterval(timer);
            }
        }, step);
    }
}

// 重置测验（供页面调用）
function resetQuiz() {
    document.querySelectorAll('.quiz-card').forEach(function (card) {
        card.classList.remove('answered');
        card.querySelectorAll('.quiz-option').forEach(function (opt) {
            opt.disabled = false;
            opt.classList.remove('correct', 'wrong');
        });
        const explanation = card.querySelector('.quiz-explanation');
        if (explanation) explanation.classList.remove('show');
    });

    const resultBox = document.querySelector('.quiz-result');
    if (resultBox) resultBox.classList.remove('show');

    // 滚动到测验区域顶部
    const quizSection = document.querySelector('.quiz-section');
    if (quizSection) {
        quizSection.scrollIntoView({ behavior: 'smooth' });
    }

    // 重新初始化
    initQuiz();
}

/* ---------- 滚动入场动画 ---------- */
function initScrollAnimation() {
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.knowledge-card, .quiz-card, .example-block').forEach(function (el) {
        observer.observe(el);
    });
}

/* ---------- 知识点导航高亮 ---------- */
function initSectionNavHighlight() {
    const navLinks = document.querySelectorAll('.section-nav a');
    if (navLinks.length === 0) return;

    const sections = [];
    navLinks.forEach(function (link) {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            const target = document.querySelector(targetId);
            if (target) {
                sections.push({ link: link, target: target });
            }
        }
    });

    if (sections.length === 0) return;

    window.addEventListener('scroll', function () {
        const scrollPos = window.scrollY + 120;

        let currentSection = sections[0];
        sections.forEach(function (sec) {
            if (sec.target.offsetTop <= scrollPos) {
                currentSection = sec;
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
        });
        currentSection.link.classList.add('active');
    });
}

/* ---------- KaTeX 渲染辅助 ---------- */
function renderMath() {
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
        });
    }
}

// 页面加载完成后渲染数学公式
window.addEventListener('load', renderMath);