import React from 'react';
import { List } from 'immutable';

let counter = 1;

export function nodeToData(svgStr) {
  const dom = document.createElement('DIV');
  dom.innerHTML = svgStr;
  const root = dom.querySelector('svg');
  let a = new List();
  for (let i = 0; i < root.childNodes.length; i++) {
    const node = root.childNodes[i];
    if (node.nodeType != 1) {
    	continue;
    }
    const type = node.nodeName.toLowerCase();
    let id = node.getAttribute('id');
    if (!id) {
      id = `temp_${counter}`;
      counter++;
    }
    const obj = {
      type,
      id
    };
    switch (type) {
      case 'path':
        obj.d = node.getAttribute('d');
        break;
      case 'circle':
        obj.cx = node.getAttribute('cx');
        obj.cy = node.getAttribute('cy');
        obj.r = node.getAttribute('r');
        break;
      case 'line':
        obj.x1 = node.getAttribute('x1');
        obj.y1 = node.getAttribute('y1');
        obj.x2 = node.getAttribute('x2');
        obj.y2 = node.getAttribute('y2');
        break;
    }
    console.log(JSON.stringify(obj));
    console.dir(obj);
    a = a.push(obj);
  }

  const ids = [];
  for (let i = 0; i < a.size; i++) {
    if (ids.indexOf(a.get(i).id) != -1) {
      const item = a.get(i);
      item.id = `${item.id}_dup_${i}`;
      a.set(i, item);
    }
    ids.push(a.get(i).id);
  }
  return a;
}

export function dataToNode(data) {
  const dom = data.map((item) => {
    let arr;
    switch (item.loopType) {
      case 'loop':
        arr = constructArr(item);
        console.dir(arr);
        return (
          <g>
            {
		            arr.map((o, i) => getUnit(item.type, o, i))
		          }
          </g>
        );
      case '2dLoop':
        arr = construct2DArr(item);
        return (
          <g>
            {
		            arr.map((a) => {
		              console.dir(a);
		              return (
		                a.map((o, i) => getUnit(item.type, o, i))
		                );
		            })
		          }
          </g>
        );
      case 'circular':
        arr = rotationArr(item);
        return (
          <g>
            {
		            arr.map((deg, i) => {
		              const rotObj = {
		                rotation: deg,
		                cx: item.loopInfo.centerX,
		                cy: item.loopInfo.centerY
		              };
		              return getRotatedUnit(item.type, item, rotObj, i);
		            })
		          }
          </g>
        );
      default:
        console.dir();
        return getUnit(item.type, item);

    }
  });
  return dom;

  function getUnit(type, obj, i) {
    let str = '';
    const addObj = {};
    if (obj.strokeWidth) {
    	addObj.strokeWidth = obj.strokeWidth;
    }
    if (obj.stroke) {
    	addObj.stroke = obj.stroke;
    }
    if (obj.fill) {
    	addObj.fill = obj.fill;
    }
    let id = obj.id;
    if (i) {
      id += `_${i}`;
    }
    addObj.key = id;
    addObj.id = id;

    switch (type) {
      case 'line':
        str = <line x1={obj.x1} y1={obj.y1} x2={obj.x2} y2={obj.y2} {...addObj} />;
        break;
      case 'circle':
        str = <circle cx={obj.cx} cy={obj.cy} r={obj.r} {...addObj} />;
        break;
      case 'ellipse':
        str = <ellipse cx={obj.cx} cy={obj.cy} rx={obj.rx} ry={obj.ry} {...addObj} />;
        break;
      case 'path':
        str = <path d={obj.d} {...addObj} />;
        break;
    }
    return str;
  }

  function getRotatedUnit(type, obj, rotObj, i) {
    let str = '';
    const addObj = {};
    if (obj.strokeWidth) {
    	addObj.strokeWidth = obj.strokeWidth;
    }
    if (obj.stroke) {
    	addObj.stroke = obj.stroke;
    }
    if (obj.fill) {
    	addObj.fill = obj.fill;
    }
    let id = obj.id;
    if (i) {
      id += `_${i}`;
    }
    addObj.key = id;
    addObj.id = id;
    switch (type) {
      case 'line':
        console.log('LLLLine');
        str = (<line
          x1={obj.x1}
          y1={obj.y1}
          x2={obj.x2}
          y2={obj.y2}
          transform={`rotate(${rotObj.rotation},${rotObj.cx},${rotObj.cy})`}
          {...addObj}
        />);
        break;
      case 'circle':
        str = (<circle
          cx={obj.cx}
          cy={obj.cy}
          r={obj.r}
          transform={`rotate(${rotObj.rotation},${rotObj.cx},${rotObj.cy})`}
          {...addObj}
        />);
        break;
      case 'ellipse':
        str = (<ellipse
          cx={obj.cx}
          cy={obj.cy}
          rx={obj.rx}
          ry={obj.ry}
          transform={`rotate(${rotObj.rotation},${rotObj.cx},${rotObj.cy})`}
          {...addObj}
        />);
        break;
      case 'path':
        str = (<path
          d={obj.d}
          transform={`rotate(${rotObj.rotation},${rotObj.cx},${rotObj.cy})`}
          {...addObj}
        />);
        break;
    }
    return str;
  }

  function constructArr(obj) {
    const a = [];
    for (let i = 0; i < obj.loopInfo.count; i++) {
      const o = {};
      for (const prop in obj) {
        if (['x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'r', 'rx', 'ry'].indexOf(prop) != -1) {
          if (obj[prop] == 'x') {
            o[prop] = Number(obj.loopInfo.offset) + (Number(obj.loopInfo.step) * i);
          } else {
            o[prop] = obj[prop];
          }
        }
        if (obj.d) {
          const x = Number(obj.loopInfo.offset) + (Number(obj.loopInfo.step) * i);
          o.d = obj.d.replace(/x/g, `${x}`);
          while (o.d.indexOf('(') != -1) {
          	const start = o.d.indexOf('(');
          	const end = o.d.indexOf(')');
          	o.d = o.d.substr(0, start) + eval(o.d.substr(start + 1, end)) + o.d.substr(end + 1);
          }
        }
      }
      a.push(o);
    }
    return a;
  }

  function construct2DArr(obj) {
    const a = [];
    for (let i = 0; i < obj.loopInfo.count; i++) {
      const arr = [];
      for (let j = 0; j < obj.loopInfo.county; j++) {
        const o = {};
        for (const prop in obj) {
          if (obj[prop] == 'x') {
            o[prop] = Number(obj.loopInfo.offset) + (Number(obj.loopInfo.step) * i);
          } else if (obj[prop] == 'y') {
            o[prop] = Number(obj.loopInfo.offsety) + (Number(obj.loopInfo.stepy) * j);
          } else {
            o[prop] = obj[prop];
          }
        }
        arr.push(o);
      }
      a.push(arr);
    }
    console.dir(a);
    return a;
  }

  function rotationArr(obj) {
    const a = [];
    for (let i = 0; i < obj.loopInfo.count; i++) {
      a.push(360 / obj.loopInfo.count * i);
    }
    return a;
  }
}

export function dataToObj(str) {
  // let str = 'M 100 100 L 100 200 L 200 200 Q 100 250 200 300 L 300 300 L 300 400 L 400 400 C 400 300 450 300 450 450';
  console.log(`dataToObj ${str}`);
  const reg = /[MLCQ][\-?0-9\s]+/g;
  const arr = [];
  while (true) {
    const val = reg.exec(str);
    if (!val || val.length == 0) {
      break;
    } else {
      arr.push(val[0]);
    }
  }
  const data = [];
  for (let i = 0; i < arr.length; i++) {
    const a = arr[i].split(' ');
    const obj = dataToObjUnit(arr[i]);
    // console.dir(obj);
    if (obj) {
    	data.push(obj);
    }
  }
  return data;
}

export function dataToObjUnit(str) {
  str = str.trim();
  str = str.replace(/\s+/, ' ');
  const a = str.split(' ');
  let obj;
  switch (a[0]) {
    case 'M':
    case 'L':
      obj = {
        type: a[0],
        x: parseInt(a[1]),
        y: parseInt(a[2])
      };
      if (a.length != 3 || obj.x == NaN || obj.y == NaN) {
        	return null;
      }
      break;
    case 'C':
      obj = {
        type: a[0],
        ctx: parseInt(a[1]),
        cty: parseInt(a[2]),
        ct2x: parseInt(a[3]),
        ct2y: parseInt(a[4]),
        x: parseInt(a[5]),
        y: parseInt(a[6])
      };
      if (a.length != 7 || obj.x == NaN || obj.y == NaN) {
        	return null;
      }
      break;
    case 'Q':
      obj = {
        type: a[0],
        ctx: parseInt(a[1]),
        cty: parseInt(a[2]),
        x: parseInt(a[3]),
        y: parseInt(a[4])
      };
      if (a.length != 5 || obj.x == NaN || obj.y == NaN) {
        	return null;
      }
      break;
  }
  return obj;
}

// d is a List
export function objToData(d) {
  let str = '';
  for (let i = 0; i < d.length; i++) {
    const obj = d[i];
    switch (obj.type) {
      case 'M':
      case 'L':
        str += `${obj.type} ${obj.x} ${obj.y} `;
        break;
      case 'C':
        str += `${obj.type} ${obj.ctx} ${obj.cty} ${obj.ct2x} ${obj.ct2y} ${obj.x} ${obj.y} `;
        break;
      case 'Q':
        str += `${obj.type} ${obj.ctx} ${obj.cty} ${obj.x} ${obj.y} `;
        break;
    }
  }
  return str;
}

export function translate(d, tx, ty) {
  console.log(tx, ty, d.size);
  let list = new List();
  for (let i = 0; i < d.size; i++) {
    const obj = Object.assign({}, d.get(i));
    console.dir(obj);
    switch (obj.type) {
      case 'M':
      case 'L':
        obj.x += tx;
        obj.y += ty;
        break;
      case 'C':
        obj.x += tx;
        obj.ctx += tx;
        obj.ct2x += tx;
        obj.y += ty;
        obj.cty += ty;
        obj.ct2y += ty;
        break;
      case 'Q':
        obj.x += tx;
        obj.ctx += tx;
        obj.y += ty;
        obj.cty += ty;
        break;
    }
    list = list.push(obj);
  }
  console.dir(list.toJS());
  return list;
}

export function resize(d, ox, oy, sx, sy) {
  let list = new List();
  console.log(ox, oy, sx, sy);
  for (let i = 0; i < d.size; i++) {
    const obj = Object.assign({}, d.get(i));
    console.dir(obj);
    switch (obj.type) {
      case 'M':
      case 'L':
        obj.x = parseInt(ox + (obj.x - ox) * sx);
        obj.y = parseInt(oy + (obj.y - oy) * sy);
        break;
      case 'C':
        obj.x = parseInt(ox + (obj.x - ox) * sx);
        obj.ctx = parseInt(ox + (obj.ctx - ox) * sx);
        obj.ct2x = parseInt(ox + (obj.ct2x - ox) * sx);
        obj.y = parseInt(oy + (obj.y - oy) * sy);
        obj.cty = parseInt(oy + (obj.cty - oy) * sy);
        obj.ct2y = parseInt(oy + (obj.ct2y - oy) * sy);
        break;
      case 'Q':
        obj.x = parseInt(ox + (obj.x - ox) * sx);
        obj.ctx = parseInt(ox + (obj.ctx - ox) * sx);
        obj.y = parseInt(oy + (obj.y - oy) * sy);
        obj.cty = parseInt(oy + (obj.cty - oy) * sy);
        break;
    }
    list = list.push(obj);
  }
  console.dir(list.toJS());
  return list;
}


export function rotate(d, ox, oy, r) {
  r = r * Math.PI / 180 * -1;
  let list = new List();
  for (let i = 0; i < d.size; i++) {
    const obj = Object.assign({}, d.get(i));
    console.dir(obj);
    let dx,
      dy,
      x,
      y;
    switch (obj.type) {
      case 'M':
      case 'L':
        dx = obj.x - ox;
        dy = obj.y - oy;
        x = ox + dx * Math.cos(r) + dy * Math.sin(r);
        y = oy + dy * Math.cos(r) - dx * Math.sin(r);
        obj.x = parseInt(x);
        obj.y = parseInt(y);
        break;
      case 'C':

        dx = obj.x - ox;
        dy = obj.y - oy;
        x = ox + dx * Math.cos(r) + dy * Math.sin(r);
        y = oy + dy * Math.cos(r) - dx * Math.sin(r);
        obj.x = parseInt(x);
        obj.y = parseInt(y);

        dx = obj.ctx - ox;
        dy = obj.cty - oy;
        x = ox + dx * Math.cos(r) + dy * Math.sin(r);
        y = oy + dy * Math.cos(r) - dx * Math.sin(r);
        obj.ctx = parseInt(x);
        obj.cty = parseInt(y);

        dx = obj.ct2x - ox;
        dy = obj.ct2y - oy;
        x = ox + dx * Math.cos(r) + dy * Math.sin(r);
        y = oy + dy * Math.cos(r) - dx * Math.sin(r);
        obj.ct2x = parseInt(x);
        obj.ct2y = parseInt(y);

        break;
      case 'Q':
      /*
        obj.x = parseInt(ox + (obj.x - ox) * sx);
        obj.ctx = parseInt(ox + (obj.ctx - ox) * sx);
        obj.y = parseInt(oy + (obj.y - oy) * sy);
        obj.cty = parseInt(oy + (obj.cty - oy) * sy);*/
        break;
    }
    list = list.push(obj);
  }
  console.dir(list.toJS());
  return list;
}


export function toData(pt, domRef, zoom) {
  if (!domRef) {
    domRef = document.getElementById('contentSvg');
  }
  return {
    x: parseInt((pt.x - parseInt(domRef.getAttribute('x'))) / zoom),
    y: parseInt((pt.y - parseInt(domRef.getAttribute('y'))) / zoom)
  };
}


export function toActual(pt, domRef, zoom) {
  if (!domRef) {
    domRef = document.getElementById('contentSvg');
  }
  return {
    x: parseInt(pt.x * zoom + parseInt(domRef.getAttribute('x'))),
    y: parseInt(pt.y * zoom + parseInt(domRef.getAttribute('y')))
  };
}

export function attr(node, obj) {
  for (const i of Object.keys(obj)) {
    node.setAttribute(i, obj[i]);
  }
}
