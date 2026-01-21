(function () {
  var DATA_URL = "./assets/data/skills_network_en.json";
  var bgContainer = document.getElementById("bg-network");
  var windowContainer = document.getElementById("skills-graph");
  var errorBox = document.getElementById("skills-error");

  var colors = {
    core: "#b04b4b",
    software: "#54687d",
    math: "#6a6f7f",
    physics: "#74645a",
    networks: "#5b6b74",
    ml: "#6a7364",
    robotics: "#7b5a66",
    methods: "#6b6274"
  };
  var coreIds = [
    "Non-equilibrium Physics",
    "Self-organization & Pattern Formation",
    "Modern Dynamics",
    "Swarm Robotics",
    "General Swarm Intelligence"
  ];
  var coreTopIds = [
    "Non-equilibrium Physics",
    "Self-organization & Pattern Formation",
    "Modern Dynamics"
  ];
  var coreBottomIds = [
    "Swarm Robotics",
    "General Swarm Intelligence"
  ];
  var groupCoreMap = {
    software: "Modern Dynamics",
    math: "Modern Dynamics",
    physics: "Non-equilibrium Physics",
    networks: "Self-organization & Pattern Formation",
    ml: "General Swarm Intelligence",
    robotics: "Swarm Robotics",
    methods: "Modern Dynamics"
  };
  var coreX = 640;
  var coreSpacing = 90;
  var coreYSign = 1;
  var coreColumnGap = 140;
  var coreColumnLeft = coreX - coreColumnGap + 80;
  var coreColumnRight = coreX + coreColumnGap;
  var coreLeftShiftX = 40;
  var coreLeftShiftY = 60;
  var coreRightShiftX = -120;
  var coreGlobalShiftX = -55;
  var coreGlobalShiftY = 95;
  var coreMidExtraUp = 28;
  var coreGsiDown = -18;
  var coreTargetPos = {
    "Non-equilibrium Physics": { x: coreColumnLeft + coreLeftShiftX - 30 + coreGlobalShiftX, y: coreSpacing * 2.1 * coreYSign + coreLeftShiftY + coreGlobalShiftY },
    "Self-organization & Pattern Formation": { x: coreColumnLeft + coreLeftShiftX - 30 + coreGlobalShiftX, y: coreSpacing * 1.2 * coreYSign + coreLeftShiftY + coreGlobalShiftY + coreMidExtraUp },
    "Modern Dynamics": { x: coreColumnLeft + coreLeftShiftX + coreGlobalShiftX - 30, y: coreSpacing * 0.3 * coreYSign + coreLeftShiftY + 25 + coreGlobalShiftY + coreMidExtraUp },
    "Swarm Robotics": { x: coreColumnRight + coreRightShiftX - 30 + coreGlobalShiftX, y: coreSpacing * 1.6 * coreYSign + coreGlobalShiftY },
    "General Swarm Intelligence": { x: coreColumnRight + coreRightShiftX - 30 + coreGlobalShiftX, y: coreSpacing * 2.6 * coreYSign + coreGlobalShiftY + coreGsiDown }
  };
  var coreTargets = coreIds.map(function (id) { return coreTargetPos[id] || { x: coreX, y: 0 }; });
  var coreXValues = coreTargets.map(function (pos) { return pos.x; });
  var coreYValues = coreTargets.map(function (pos) { return pos.y; });
  var coreXCenter = (Math.min.apply(Math, coreXValues) + Math.max.apply(Math, coreXValues)) / 2;
  var coreYCenter = (Math.min.apply(Math, coreYValues) + Math.max.apply(Math, coreYValues)) / 2;
  var coreViewOffsetY = -70;

  var showError = function (message) {
    if (!errorBox) {
      return;
    }
    errorBox.textContent = message;
    errorBox.style.display = "flex";
  };

  var cloneData = function (data) {
    return {
      nodes: data.nodes.map(function (node) { return Object.assign({}, node); }),
      links: data.links.map(function (link) { return Object.assign({}, link); })
    };
  };

  var prepareWindowData = function (data) {
    var nodesById = {};
    data.nodes.forEach(function (node) {
      nodesById[node.id] = node;
    });

    var corePositions = {};
    coreIds.forEach(function (id) {
      var node = nodesById[id];
      if (!node) {
        return;
      }
      var target = coreTargetPos[id] || { x: coreX, y: 0 };
      node.x = target.x;
      node.y = target.y;
      node.z = 0;
      node.fx = target.x;
      node.fy = target.y;
      node.fz = 0;
      corePositions[id] = { x: node.x, y: node.y, z: 0 };
    });

    var anchors = [];
    data.nodes.forEach(function (node) {
      if (node.group === "core") {
        return;
      }
      var coreId = groupCoreMap[node.group];
      var anchor = corePositions[coreId];
      if (!coreId || !anchor) {
        return;
      }
      node.x = anchor.x - 70 + (Math.random() - 0.5) * 120;
      node.y = anchor.y + (Math.random() - 0.5) * 90;
      node.z = (Math.random() - 0.5) * 70;
      anchors.push({ source: node.id, target: coreId, __anchor: true });
    });

    data.links = data.links.concat(anchors);
    return data;
  };

  var hexToRgb = function (hex) {
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
  };

  var glowCache = {};
  var makeGlowTexture = function (color, intensity) {
    var key = color + "-" + intensity;
    if (glowCache[key]) {
      return glowCache[key];
    }
    var rgb = hexToRgb(color);
    var size = 128;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    var gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + intensity + ")");
    gradient.addColorStop(0.4, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + (intensity * 0.35) + ")");
    gradient.addColorStop(1, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    var texture = new THREE.CanvasTexture(canvas);
    glowCache[key] = texture;
    return texture;
  };

  var buildNodeObject = function (node, options) {
    var color = colors[node.group] || "#6b7280";
    var isCore = node.group === "core";
    var size = Math.max(options.minSize, node.val * options.sizeScale);
    if (isCore) {
      size = size * 1.2;
    }
    var group = new THREE.Group();
    var material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: isCore ? options.emissiveIntensity * 1.15 : options.emissiveIntensity,
      roughness: isCore ? options.roughness * 0.9 : options.roughness,
      metalness: options.metalness,
      transparent: options.transparent,
      opacity: options.opacity
    });
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(size, 24, 24), material);
    group.add(sphere);

    var glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture(color, options.glowIntensity),
        color: color,
        transparent: true,
        opacity: options.glowOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    var glowScale = isCore ? options.glowScale * 1.05 : options.glowScale;
    glow.scale.set(size * glowScale, size * glowScale, 1);
    group.add(glow);

    if (options.showLabels && window.SpriteText) {
      var label = new SpriteText(node.id);
      label.color = options.labelColor;
      label.backgroundColor = isCore ? "rgba(18, 10, 12, 0.45)" : options.labelBackground;
      label.borderWidth = options.labelBorderWidth;
      label.borderColor = isCore ? "rgba(235, 200, 200, 0.42)" : options.labelBorderColor;
      label.fontFace = "Montserrat";
      label.fontWeight = "600";
      label.textHeight = (options.labelBase + node.val * options.labelScale) * (isCore ? 1.1 : 1);
      label.strokeWidth = options.labelStrokeWidth;
      label.strokeColor = options.labelStroke;
      label.position.y = size * (isCore ? options.labelOffset * 1.15 : options.labelOffset);
      if (label.material) {
        label.material.depthTest = false;
        label.material.depthWrite = false;
      }
      label.renderOrder = 999;
      group.add(label);
    }

    return group;
  };

  var initWindowGraph = function (data) {
    if (!windowContainer) {
      return null;
    }

    var options = {
      minSize: 1.6,
      sizeScale: 0.18,
      emissiveIntensity: 0.34,
      roughness: 0.38,
      metalness: 0.26,
      transparent: false,
      opacity: 1,
      glowIntensity: 0.55,
      glowOpacity: 0.78,
      glowScale: 3.1,
      showLabels: true,
      labelColor: "rgba(230, 236, 246, 0.92)",
      labelBackground: "rgba(9, 12, 18, 0.32)",
      labelBorderWidth: 0.6,
      labelBorderColor: "rgba(210, 216, 228, 0.2)",
      labelStrokeWidth: 0.8,
      labelStroke: "rgba(0, 0, 0, 0.42)",
      labelBase: 2.6,
      labelScale: 0.065,
      labelOffset: 1.6
    };

    var graph = ForceGraph3D()(windowContainer)
      .graphData(data)
      .backgroundColor("rgba(0,0,0,0)")
      .showNavInfo(false)
      .nodeColor(function (node) { return colors[node.group] || "#6b7280"; })
      .nodeVal("val")
      .nodeRelSize(0.95)
      .nodeOpacity(0.98)
      .nodeThreeObject(function (node) { return buildNodeObject(node, options); })
      .linkColor(function () { return "rgba(185, 190, 206, 0.34)"; })
      .linkWidth(0.6)
      .linkOpacity(0.45)
      .linkDirectionalParticles(1)
      .linkDirectionalParticleWidth(0.7)
      .linkDirectionalParticleSpeed(0.0018)
      .linkDirectionalParticleColor(function () { return "rgba(205, 210, 225, 0.3)"; })
      .enablePointerInteraction(true)
      .enableNodeDrag(true);

    graph.d3Force("charge").strength(-160);
    graph.d3Force("link").distance(function (link) {
      return link.__anchor ? 55 : 90;
    });
    graph.d3Force("link").strength(function (link) {
      return link.__anchor ? 0.9 : 0.4;
    });
    var centerForce = graph.d3Force("center");
    if (centerForce && typeof centerForce.x === "function") {
      centerForce.x(0).y(0).z(0);
    }
    graph.cameraPosition({ x: 190, y: 90, z: 260 }, { x: 0, y: 0, z: 0 });
    if (typeof graph.centerAt === "function") {
      graph.centerAt(0, 0, 0);
    }

    var controls = graph.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.22;
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.screenSpacePanning = true;
    }

    var rotateTimer;
    windowContainer.addEventListener("pointerdown", function () {
      if (controls) {
        controls.autoRotate = false;
      }
      if (rotateTimer) {
        clearTimeout(rotateTimer);
      }
    });
    windowContainer.addEventListener("pointerup", function () {
      if (!controls) {
        return;
      }
      if (rotateTimer) {
        clearTimeout(rotateTimer);
      }
      rotateTimer = setTimeout(function () {
        controls.autoRotate = true;
      }, 1400);
    });

    var scene = graph.scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var point = new THREE.PointLight(0xffffff, 0.75);
    point.position.set(140, 140, 180);
    scene.add(point);

    return graph;
  };

  var settleWindowGraph = function (graph) {
    if (!graph) {
      return;
    }
    setTimeout(function () {
      var data = graph.graphData();
      if (data && Array.isArray(data.nodes)) {
        var coreNodes = data.nodes.filter(function (node) { return node.group === "core"; });
        coreNodes.forEach(function (node) {
          var target = coreTargetPos[node.id] || { x: coreX, y: 0 };
          node.fx = target.x;
          node.fy = target.y;
          var idx = coreIds.indexOf(node.id);
          node.fz = (idx % 2 === 0 ? 1 : -1) * 28;
        });
      }
      var centerForce = graph.d3Force("center");
      if (centerForce && typeof centerForce.x === "function") {
        centerForce.x(coreXCenter).y(coreYCenter).z(0);
      }
      if (typeof graph.centerAt === "function") {
        graph.centerAt(coreXCenter, coreYCenter + coreViewOffsetY, 0);
      }
      graph.cameraPosition({ x: 680, y: 170, z: 380 }, { x: coreXCenter - 180, y: coreYCenter + coreViewOffsetY, z: 0 }, 1500);
      if (typeof graph.d3ReheatSimulation === "function") {
        graph.d3ReheatSimulation();
      }
    }, 1400);
  };

  var initBackgroundGraph = function (data) {
    if (!bgContainer) {
      return null;
    }

    var options = {
      minSize: 3.2,
      sizeScale: 0.44,
      emissiveIntensity: 0.2,
      roughness: 0.5,
      metalness: 0.12,
      transparent: true,
      opacity: 0.68,
      glowIntensity: 0.46,
      glowOpacity: 0.6,
      glowScale: 5.2,
      showLabels: false,
      labelColor: "rgba(220, 226, 240, 0.2)",
      labelBackground: "rgba(0, 0, 0, 0)",
      labelBorderWidth: 0,
      labelBorderColor: "rgba(0, 0, 0, 0)",
      labelStrokeWidth: 0,
      labelStroke: "rgba(0, 0, 0, 0)",
      labelBase: 0,
      labelScale: 0,
      labelOffset: 0
    };

    var graph = ForceGraph3D()(bgContainer)
      .graphData(data)
      .backgroundColor("rgba(0,0,0,0)")
      .showNavInfo(false)
      .nodeColor(function (node) { return colors[node.group] || "#6b7280"; })
      .nodeVal("val")
      .nodeRelSize(0.7)
      .nodeOpacity(0.48)
      .nodeThreeObject(function (node) { return buildNodeObject(node, options); })
      .linkColor(function () { return "rgba(190, 200, 220, 0.36)"; })
      .linkWidth(0.85)
      .linkOpacity(0.42)
      .linkDirectionalParticles(0)
      .enablePointerInteraction(false)
      .enableNodeDrag(false);

    graph.cooldownTicks(1000000000);
    graph.cooldownTime(1000000000);
    graph.d3Force("charge").strength(-180);
    graph.d3Force("link").distance(165);
    graph.cameraPosition({ x: 0, y: 0, z: 560 });

    var controls = graph.controls();
    if (controls) {
      controls.autoRotate = false;
      controls.enableZoom = false;
      controls.enablePan = false;
    }

    var scene = graph.scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    var point = new THREE.PointLight(0xffffff, 0.3);
    point.position.set(120, 120, 120);
    scene.add(point);

    return graph;
  };

  var startBackgroundSpin = function (graph) {
    if (!graph) {
      return;
    }
    var angle = 0;
    var distance = 560;
    var tick = function () {
      angle += 0.0008;
      graph.cameraPosition(
        {
          x: Math.sin(angle) * distance,
          y: Math.sin(angle * 0.45) * 40,
          z: Math.cos(angle) * distance
        },
        { x: 0, y: 0, z: 0 },
        0
      );
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  var init = function () {
    if (!window.ForceGraph3D || !window.THREE) {
      showError("Skills network failed to load. Please refresh or check your network.");
      return;
    }

    fetch(DATA_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load network data");
        }
        return response.json();
      })
      .then(function (data) {
        var windowGraph = initWindowGraph(prepareWindowData(cloneData(data)));
        var bgGraph = initBackgroundGraph(cloneData(data));
        startBackgroundSpin(bgGraph);
        settleWindowGraph(windowGraph);

        var resize = function () {
          if (windowGraph && windowContainer) {
            windowGraph.width(windowContainer.clientWidth);
            windowGraph.height(windowContainer.clientHeight);
          }
          if (bgGraph && bgContainer) {
            bgGraph.width(bgContainer.clientWidth || window.innerWidth);
            bgGraph.height(bgContainer.clientHeight || window.innerHeight);
          }
        };

        window.addEventListener("resize", resize);
        window.resizeSkillsGraph = resize;
        resize();
      })
      .catch(function () {
        showError("Skills network failed to load. Please refresh or check your network.");
      });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
