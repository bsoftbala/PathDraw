export function getRect(obj){
  let {x,y,width,height, borderRadius} = obj;
  x = Number(x);
  y = Number(y);
  width = Number(width);
  height = Number(height);
  borderRadius = Number(borderRadius);

  let d = 'M '+ (x + borderRadius) + ' ' + y ;
  d += ' L ' + (x + width - borderRadius) + ' ' + y;
  d += ' Q ' + (x + width) + ' ' + y + ' ' + (x + width) + ' ' + (y + borderRadius);
  d += ' L ' + (x + width) + ' ' + (y + height - borderRadius);
  d += ' Q ' + (x + width) + ' ' + (y + height) + ' ' + (x + width - borderRadius) + ' ' + (y + height);
  d += ' L ' + (x + borderRadius) + ' ' + (y + height);
  d += ' Q ' + x + ' ' + (y + height) + ' ' + x + ' ' + (y + height - borderRadius);
  d += ' L ' + x + ' ' + (y + borderRadius);
  d += ' Q ' + x + ' ' + y + ' ' + (x + borderRadius) + ' ' + y;
  return d;
}

export function getEllipse(obj){
    let {cx, cy, rx, ry} = obj;
    var kappa = .5522848,
      ox = parseInt(rx * kappa), // control point offset horizontal
      oy = parseInt(ry * kappa), // control point offset vertical
      xe = cx + rx,           // x-end
      ye = cy + ry,           // y-end
      xm = cx,       // x-middle
      ym = cy;       // y-middle

    let x = cx - rx,
      y = cy - ry;

    let d = 'M ' + x + ' ' + ym;
    d += ' C '+ x  + ' ' + (ym - oy) + ' ' + (xm - ox) + ' ' + y + ' ' + xm + ' ' + y;
    d += ' C '+ (xm + ox)  + ' ' + y + ' ' + xe + ' ' + (ym - oy) + ' ' + xe + ' ' + ym;
    d += ' C '+ xe  + ' ' + (ym + oy) + ' ' + (xm + ox) + ' ' + ye + ' ' + xm + ' ' + ye;
    d += ' C '+ (xm - ox)  + ' ' + ye + ' ' + x + ' ' + (ym + oy) + ' ' + x + ' ' + ym;
    console.log("d = " + d);
    return d;
    /*
    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    //ctx.closePath(); // not used correctly, see comments (use to close off open path)
    ctx.stroke();*/
  }

export function getCircle(obj){
    obj = {...obj};
    obj.rx = obj.r;
    obj.ry = obj.r;
    return getEllipse(obj);
}

export function getLine(obj){
    return 'M ' + obj.x1 + ' ' + obj.y1 + ' L ' + obj.x2 + ' ' + obj.y2;
}

export function getArrow(obj){ 
    let dx = obj.x1 - obj.x2;
    let dy = obj.y1 - obj.y2;
    let angle = Math.atan2(dy, dx);
    let arrLen = 10;
    let arrAng = 45 * Math.PI/180;
    let x1 = Math.cos(angle + arrAng) * arrLen + obj.x2;
    let y1 = Math.sin(angle + arrAng) * arrLen + obj.y2;

    let x2 = Math.cos(angle - arrAng) * arrLen + obj.x2;
    let y2 = Math.sin(angle - arrAng) * arrLen + obj.y2;

    let d = 'M ' + obj.x1 + ' ' + obj.y1 + ' L ' +  obj.x2 + ' ' + obj.y2 + ' ';
    d += 'M ' + x1 + ' ' + y1 + ' L ' + obj.x2 + ' ' + obj.y2 + ' L ' + x2 + ' ' + y2;
    return d;
  }