export class StarBackground {
    constructor() {
        this.canvas = document.getElementById('star-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.meteors = []; 
        this.starCount = 150; 
        this.meteorCount = 6; // 保持适中数量
        this.mouse = { x: -9999, y: -9999 };
        
        this.colors = [
            '#d4f1f9', '#ffe9c4', '#ffffff', '#e6e6fa', '#ffd700', '#87ceeb', 
            '#ffcfdf', '#a5f3fc', '#e2e8f0', '#fef3c7', '#c4b5fd'
        ];
        
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        this.init();
    }

    init() {
        this.resize();
        this.createObjects();
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('mousemove', this.handleMouseMove);
        this.animate();
    }

    handleResize() {
        this.resize();
        this.createObjects();
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createObjects() {
        this.createStars();
        this.createMeteors();
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            const p = Math.random(); 
            let radius, shape, speedX, speedY;
            
            // 1. 极少巨大星 (0.5%)
            if (p > 0.995) {
                radius = Math.random() * 3 + 6; 
                shape = 'circle'; 
                speedX = (Math.random() - 0.5) * 0.1; 
                speedY = (Math.random() - 0.5) * 0.1;
            } 
            // 2. 曲线十字星 (5%) - 你的最爱
            else if (p > 0.945) {
                radius = Math.random() * 2 + 3; 
                shape = 'cross'; 
                speedX = 0; 
                speedY = 0; 
            }
            // 3. 普通星星
            else {
                radius = Math.random() * 1.5 + 0.5; 
                shape = 'circle'; 
                speedX = (Math.random() - 0.5) * 0.2;
                speedY = (Math.random() - 0.5) * 0.2;
            }

            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: radius, 
                baseColor: this.colors[Math.floor(Math.random() * this.colors.length)],
                shape: shape,
                baseAlpha: Math.random() * 0.5 + 0.3,
                speedX: speedX,
                speedY: speedY,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    createMeteors() {
        this.meteors = [];
        for (let i = 0; i < this.meteorCount; i++) {
            // 初始生成不延迟，直接看效果
            const m = this.resetMeteor({});
            m.delay = Math.random() * 50;
            this.meteors.push(m);
        }
    }

    resetMeteor(meteor) {
        // --- 核心修改：边缘生成 + 向心飞行 ---
        
        // 1. 随机选择一个边缘 (0:上, 1:右, 2:下, 3:左)
        const side = Math.floor(Math.random() * 4);
        const buffer = 100; // 距离屏幕边缘 100px 生成
        let startX, startY;

        if (side === 0) { // 上
            startX = Math.random() * this.width;
            startY = -buffer;
        } else if (side === 1) { // 右
            startX = this.width + buffer;
            startY = Math.random() * this.height;
        } else if (side === 2) { // 下
            startX = Math.random() * this.width;
            startY = this.height + buffer;
        } else { // 左
            startX = -buffer;
            startY = Math.random() * this.height;
        }

        meteor.x = startX;
        meteor.y = startY;

        // 2. 设定目标点为屏幕中心附近的随机区域
        // 范围：屏幕宽高的 25% ~ 75% 之间
        const targetX = this.width * 0.25 + Math.random() * this.width * 0.5;
        const targetY = this.height * 0.25 + Math.random() * this.height * 0.5;

        // 3. 计算飞行角度：从起点指向目标点
        meteor.angle = Math.atan2(targetY - startY, targetX - startX);

        // 4. 参数设定
        // 大小：1.5px - 3px (与其他星星差不多，略大一点点以示区别)
        meteor.thickness = Math.random() * .5 + .5; 
        
        // 尾巴：适中
        meteor.length = Math.random() * 50 + 80;      
        
        // 速度：稍微快点 (8 - 12)
        meteor.speed = Math.random() * 4 + 8;        
        
        meteor.alpha = 0; 
        meteor.state = 'appearing'; 
        meteor.delay = Math.random() * 100; // 稍微错开出现时间
        
        return meteor;
    }

    drawStarShape(ctx, x, y, r, shape, alpha, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;

        if (shape === 'circle') {
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        } 
        else if (shape === 'cross') {
            // 保留：带微小弧度的锋利十字星
            const innerR = r * 0.3; 
            const outerR = r * 2.5; 
            
            ctx.save();
            ctx.translate(x, y);
            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.lineTo(innerR, 0);
                ctx.lineTo(outerR, 0);
                ctx.lineTo(innerR, 0.5); 
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        
        ctx.globalAlpha = 1.0;
    }

    drawMeteor(ctx, meteor) {
        if (meteor.delay > 0) {
            meteor.delay--;
            return;
        }

        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;

        // 边界判断：加上 buffer，保证完全飞出屏幕才重置
        const buffer = 200;
        const isOutOfBounds = 
            meteor.x < -buffer || meteor.x > this.width + buffer ||
            meteor.y < -buffer || meteor.y > this.height + buffer;

        // 状态机
        if (meteor.state === 'appearing') {
            meteor.alpha += 0.05; // 显现速度
            if (meteor.alpha >= 1) meteor.state = 'moving';
        } else if (isOutOfBounds) {
            meteor.state = 'disappearing';
        }

        if (meteor.state === 'disappearing') {
            meteor.alpha -= 0.05;
            if (meteor.alpha <= 0) {
                this.resetMeteor(meteor);
                return;
            }
        }

        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.alpha})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = meteor.thickness;
        ctx.lineCap = 'round'; 
        ctx.stroke();

        // 头部
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.thickness * .2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${meteor.alpha})`;
        ctx.fill();
        
        // 微弱光晕
        ctx.shadowBlur = 10;
        ctx.shadowColor = "white";
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.stars.forEach(star => {
            star.x += star.speedX;
            star.y += star.speedY;
            
            if (star.speedX !== 0 || star.speedY !== 0) {
                if (star.x < 0) star.x = this.width;
                if (star.x > this.width) star.x = 0;
                if (star.y < 0) star.y = this.height;
                if (star.y > this.height) star.y = 0;
            }

            if (star.shape === 'cross') {
                star.angle += 0.02; 
            }

            const dx = this.mouse.x - star.x;
            const dy = this.mouse.y - star.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 350;

            let alpha = star.baseAlpha;
            let radius = star.radius;
            let drawColor = star.baseColor; 

            if (distance < maxDistance) {
                const influence = (maxDistance - distance) / maxDistance;
                const scaleFactor = star.radius > 4 ? 4.0 : 2.0;
                
                radius += influence * scaleFactor; 
                alpha += influence * 0.8;
                
                if (influence > 0.3) {
                   this.ctx.shadowBlur = 15 * influence;
                   this.ctx.shadowColor = drawColor;
                }
            } else {
                this.ctx.shadowBlur = 0;
            }

            if (alpha > 1) alpha = 1;

            this.ctx.save();
            this.ctx.translate(star.x, star.y);
            
            if (star.shape === 'cross') {
                this.ctx.rotate(star.angle);
            }
            
            this.drawStarShape(this.ctx, 0, 0, radius, star.shape, alpha, drawColor);
            
            this.ctx.restore();
        });

        this.meteors.forEach(meteor => {
            this.drawMeteor(this.ctx, meteor);
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(this.animate);
    }
}