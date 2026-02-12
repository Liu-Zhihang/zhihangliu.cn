/**
 * 3D Knowledge Network - 知识网络可视化
 * 包含全屏背景层和交互窗口
 */

(function () {
    'use strict';

    // 网络数据 - 基于知识体系图
    var networkData = {
        nodes: [
            // 核心节点
            { id: "stats", name: "Mathematical Statistics", group: "core", val: 32 },
            { id: "swarm", name: "Swarm Robotics", group: "core", val: 32 },

            // 编程 & Web
            { id: "git", name: "Git", group: "software", val: 12 },
            { id: "oop", name: "OOP in Python", group: "software", val: 14 },
            { id: "python", name: "Python", group: "software", val: 20 },
            { id: "cpp", name: "C++", group: "software", val: 14 },
            { id: "react", name: "React", group: "software", val: 14 },
            { id: "html", name: "HTML", group: "software", val: 12 },
            { id: "css", name: "CSS", group: "software", val: 12 },
            { id: "web", name: "Web Dev", group: "software", val: 14 },

            // 数学基础
            { id: "prob", name: "Probability Theory", group: "math", val: 16 },
            { id: "spatial_stats", name: "Spatial Statistics", group: "math", val: 14 },
            { id: "calculus", name: "Calculus", group: "math", val: 14 },
            { id: "linalg", name: "Linear Algebra", group: "math", val: 14 },
            { id: "bayesian", name: "Bayesian Neural Fields", group: "math", val: 14 },
            { id: "koopman", name: "Koopman Operator", group: "physics", val: 14 },

            // 物理 & 动力学
            { id: "noneq", name: "Non-equilibrium Physics", group: "physics", val: 18 },
            { id: "dynamics", name: "Modern Dynamics", group: "physics", val: 18 },
            { id: "nonlinear", name: "Nonlinear Dynamics", group: "physics", val: 14 },
            { id: "fluid", name: "Fluid Dynamics", group: "physics", val: 14 },
            { id: "percolation", name: "Percolation Dynamics", group: "physics", val: 14 },
            { id: "renorm", name: "Renormalization Group", group: "physics", val: 14 },
            { id: "selforg", name: "Self-Organization", group: "physics", val: 14 },

            // 复杂网络
            { id: "complex", name: "Complex Networks", group: "networks", val: 22 },
            { id: "multilayer", name: "Multilayer Networks", group: "networks", val: 14 },
            { id: "hypergraph", name: "Hypergraph", group: "networks", val: 14 },

            // 机器学习 & 深度学习
            { id: "dl", name: "Deep Learning", group: "ml", val: 22 },
            { id: "dl_principles", name: "DL Principles", group: "ml", val: 14 },
            { id: "diffusion", name: "Diffusion Models", group: "ml", val: 14 },
            { id: "rl", name: "Reinforcement Learning", group: "ml", val: 18 },
            { id: "cv", name: "Computer Vision", group: "ml", val: 14 },
            { id: "pinn", name: "Physics-Informed DL", group: "ml", val: 16 },
            { id: "gnn", name: "Graph Neural Networks", group: "ml", val: 16 },
            { id: "geometric", name: "Geometric DL", group: "ml", val: 14 },
            { id: "stochastic", name: "Stochastic Optimization", group: "ml", val: 14 },
            { id: "probml", name: "Probabilistic ML", group: "ml", val: 14 },
            { id: "causal", name: "Causal ML", group: "ml", val: 14 },

            // 机器人 & 智能体
            { id: "robotics", name: "Robotics Fundamentals", group: "robotics", val: 16 },
            { id: "swarm_ctrl", name: "Swarm Control", group: "robotics", val: 16 },
            { id: "distributed", name: "Distributed Control", group: "robotics", val: 14 },
            { id: "swarm_intel", name: "Swarm Intelligence", group: "robotics", val: 16 },
            { id: "spatial_agent", name: "Spatial Agents", group: "robotics", val: 14 },
            { id: "spatial_intel", name: "Spatial Intelligence", group: "robotics", val: 16 },

            // 一级节点：物理信息空间智能（与 General Swarm Intelligence 同经度）
            { id: "physics_spatial_intel", name: "Physics-Informed Spatial Intelligence", group: "core", val: 32 }
        ],
        links: [
            // 编程连接
            { source: "git", target: "python" },
            { source: "oop", target: "python" },
            { source: "python", target: "cpp" },
            { source: "python", target: "react" },
            { source: "react", target: "html" },
            { source: "html", target: "css" },
            { source: "html", target: "web" },

            // 数学连接
            { source: "prob", target: "stats" },
            { source: "stats", target: "spatial_stats" },
            { source: "stats", target: "calculus" },
            { source: "calculus", target: "linalg" },
            { source: "linalg", target: "koopman" },
            { source: "prob", target: "bayesian" },
            { source: "bayesian", target: "stats" },

            // 物理连接
            { source: "noneq", target: "dynamics" },
            { source: "dynamics", target: "nonlinear" },
            { source: "dynamics", target: "complex" },
            { source: "dynamics", target: "koopman" },
            { source: "noneq", target: "selforg" },
            { source: "renorm", target: "selforg" },
            { source: "noneq", target: "pinn" },

            // 复杂网络连接
            { source: "complex", target: "percolation" },
            { source: "complex", target: "fluid" },
            { source: "complex", target: "multilayer" },
            { source: "complex", target: "hypergraph" },
            { source: "complex", target: "gnn" },

            // 机器学习连接
            { source: "dl", target: "dl_principles" },
            { source: "dl", target: "diffusion" },
            { source: "dl", target: "cv" },
            { source: "dl", target: "gnn" },
            { source: "dl_principles", target: "stochastic" },
            { source: "stochastic", target: "probml" },
            { source: "stochastic", target: "causal" },
            { source: "probml", target: "bayesian" },
            { source: "pinn", target: "gnn" },
            { source: "gnn", target: "geometric" },
            { source: "geometric", target: "complex" },
            { source: "rl", target: "swarm" },
            { source: "cv", target: "spatial_intel" },
            { source: "spatial_intel", target: "spatial_agent" },

            // 机器人连接
            { source: "swarm", target: "robotics" },
            { source: "swarm", target: "swarm_ctrl" },
            { source: "swarm_ctrl", target: "distributed" },
            { source: "distributed", target: "swarm_intel" },
            { source: "swarm", target: "spatial_agent" },

            // 跨领域连接
            { source: "web", target: "spatial_agent" },
            { source: "complex", target: "swarm" },
            { source: "spatial_stats", target: "spatial_intel" },
            { source: "pinn", target: "dynamics" },

            // 物理信息空间智能：与 Swarm Intelligence 同侧，置于底部
            { source: "physics_spatial_intel", target: "swarm_intel" },
            { source: "spatial_intel", target: "physics_spatial_intel" },
            { source: "pinn", target: "physics_spatial_intel" }
        ]
    };

    // 颜色配置
    var colors = {
        core: "#c45a5a",
        software: "#5a8fba",
        math: "#7a8f9e",
        physics: "#8a7a6a",
        networks: "#6a8a7a",
        ml: "#9a8a5a",
        robotics: "#8a6a7a"
    };

    // 工具函数：Hex to RGB
    function hexToRgb(hex) {
        var value = hex.replace("#", "");
        if (value.length === 3) {
            value = value.split("").map(function (c) { return c + c; }).join("");
        }
        var num = parseInt(value, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    }

    // 缓存发光纹理
    var glowCache = {};
    function makeGlowTexture(color, opacity) {
        var key = color + "_" + opacity;
        if (glowCache[key]) return glowCache[key];

        var rgb = hexToRgb(color);
        var size = 128;
        var canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext("2d");
        var gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + (opacity * 0.6) + ")");
        gradient.addColorStop(0.4, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + (opacity * 0.25) + ")");
        gradient.addColorStop(1, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        var texture = new THREE.CanvasTexture(canvas);
        glowCache[key] = texture;
        return texture;
    }

    // 创建节点对象
    function buildNodeObject(node, isBackground) {
        var color = colors[node.group] || "#6b7280";
        var sizeMultiplier = isBackground ? 0.6 : 0.8;
        var size = Math.max(4, node.val * sizeMultiplier);
        var textOpacity = isBackground ? 0.5 : 0.9;
        var glowOpacity = isBackground ? 0.3 : 1;

        var group = new THREE.Group();

        // 球体
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(size, 24, 24),
            new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: isBackground ? 0.15 : 0.35,
                roughness: 0.4,
                metalness: 0.25,
                transparent: isBackground,
                opacity: isBackground ? 0.6 : 1
            })
        );

        // 发光效果
        var glow = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: makeGlowTexture(color, glowOpacity),
                color: color,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        glow.scale.set(size * 5, size * 5, 1);
        group.add(glow);
        group.add(sphere);

        // 文字标签
        if (window.SpriteText) {
            var label = new SpriteText(node.name);
            label.color = isBackground ? "rgba(200, 210, 220, 0.5)" : "rgba(230, 235, 245, 0.95)";
            label.backgroundColor = isBackground ? "transparent" : "rgba(10, 12, 18, 0.35)";
            label.borderWidth = isBackground ? 0 : 0.5;
            label.borderColor = "rgba(200, 210, 220, 0.2)";
            label.fontFace = "Montserrat, sans-serif";
            label.fontWeight = "600";
            label.textHeight = isBackground ? (4 + node.val * 0.08) : (5 + node.val * 0.12);
            label.strokeWidth = isBackground ? 0 : 0.8;
            label.strokeColor = "rgba(0,0,0,0.5)";
            label.position.y = size * 1.8;
            group.add(label);
        }

        return group;
    }

    // 初始化背景层网络
    function initBackgroundNetwork() {
        var container = document.getElementById("network-background");
        if (!container || !window.ForceGraph3D || !window.THREE) {
            console.warn("Background network: missing dependencies");
            return null;
        }

        var graph = ForceGraph3D()(container)
            .graphData(JSON.parse(JSON.stringify(networkData)))
            .backgroundColor("rgba(0,0,0,0)")
            .showNavInfo(false)
            .nodeColor(function (node) { return colors[node.group] || "#6b7280"; })
            .nodeVal("val")
            .nodeRelSize(0.5)
            .nodeResolution(20)
            .nodeOpacity(0.5)
            .nodeThreeObject(function (node) { return buildNodeObject(node, true); })
            .linkColor(function () { return "rgba(150, 160, 180, 0.15)"; })
            .linkWidth(0.4)
            .linkOpacity(0.25)
            .linkDirectionalParticles(1)
            .linkDirectionalParticleWidth(0.5)
            .linkDirectionalParticleSpeed(0.001)
            .linkDirectionalParticleColor(function () { return "rgba(180, 190, 210, 0.2)"; })
            .enablePointerInteraction(false)
            .enableNodeDrag(false);

        graph.d3Force("charge").strength(-250);
        graph.d3Force("link").distance(100);
        graph.cameraPosition({ x: 300, y: 100, z: 400 });

        var controls = graph.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.15;
            controls.enableZoom = false;
            controls.enablePan = false;
            controls.enableRotate = false;
        }

        var scene = graph.scene();
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));

        function resize() {
            graph.width(window.innerWidth);
            graph.height(window.innerHeight);
        }
        window.addEventListener("resize", resize);
        resize();

        return graph;
    }

    // 初始化交互窗口网络
    function initInteractiveNetwork() {
        var container = document.getElementById("skills-graph");
        var errorBox = document.getElementById("skills-error");

        if (!container) {
            console.warn("Interactive network: container not found");
            return null;
        }

        if (!window.ForceGraph3D || !window.THREE) {
            if (errorBox) {
                errorBox.textContent = "3D network failed to load. Please refresh.";
                errorBox.style.display = "flex";
            }
            return null;
        }

        var graph = ForceGraph3D()(container)
            .graphData(JSON.parse(JSON.stringify(networkData)))
            .backgroundColor("rgba(0,0,0,0)")
            .showNavInfo(false)
            .nodeColor(function (node) { return colors[node.group] || "#6b7280"; })
            .nodeVal("val")
            .nodeRelSize(0.7)
            .nodeResolution(24)
            .nodeOpacity(0.95)
            .nodeThreeObject(function (node) { return buildNodeObject(node, false); })
            .linkColor(function () { return "rgba(175, 185, 200, 0.28)"; })
            .linkWidth(0.6)
            .linkOpacity(0.45)
            .linkDirectionalParticles(1)
            .linkDirectionalParticleWidth(0.8)
            .linkDirectionalParticleSpeed(0.002)
            .linkDirectionalParticleColor(function () { return "rgba(200, 210, 230, 0.35)"; })
            .enablePointerInteraction(true)
            .enableNodeDrag(true);

        graph.d3Force("charge").strength(-380);
        graph.d3Force("link").distance(120);
        graph.cameraPosition({ x: 200, y: 80, z: 280 }, { x: 30, y: 0, z: 0 });

        var controls = graph.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.3;
            controls.enableZoom = true;
            controls.enablePan = true;
        }

        // 暂停/恢复自动旋转
        var rotateTimer;
        container.addEventListener("pointerdown", function () {
            if (controls) controls.autoRotate = false;
            clearTimeout(rotateTimer);
        });
        container.addEventListener("pointerup", function () {
            if (!controls) return;
            clearTimeout(rotateTimer);
            rotateTimer = setTimeout(function () {
                controls.autoRotate = true;
            }, 1500);
        });

        var scene = graph.scene();
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        var point = new THREE.PointLight(0xffffff, 0.7);
        point.position.set(150, 150, 200);
        scene.add(point);

        function resize() {
            graph.width(container.clientWidth);
            graph.height(container.clientHeight);
        }
        window.addEventListener("resize", resize);
        window.resizeSkillsGraph = resize;
        resize();

        return graph;
    }

    // 初始化
    function init() {
        // 等待依赖加载
        if (!window.ForceGraph3D || !window.THREE) {
            setTimeout(init, 100);
            return;
        }

        initBackgroundNetwork();
        initInteractiveNetwork();
    }

    // 页面加载后初始化
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
