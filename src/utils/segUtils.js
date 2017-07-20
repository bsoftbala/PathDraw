function changeType(prevObj, obj, type) {
  console.log('changeType');
  console.dir(obj);
  if (obj.type == type) {
    return obj;
  }
  const newObj = { ...obj };
  newObj.type = type;
  switch (type) {
    case 'C':
      if (!obj.ctx) {
        newObj.ctx = parseInt(prevObj.x + (obj.x - prevObj.x) / 3);
        newObj.cty = parseInt(prevObj.y + (obj.y - prevObj.y) / 3);
      }
      newObj.ct2x = parseInt(prevObj.x + (obj.x - prevObj.x) / 3 * 2);
      newObj.ct2y = parseInt(prevObj.y + (obj.y - prevObj.y) / 3 * 2);
      break;
    case 'Q':
      if (!obj.ctx) {
        newObj.ctx = parseInt(prevObj.x + (obj.x - prevObj.x) / 2);
        newObj.cty = parseInt(prevObj.y + (obj.y - prevObj.y) / 2);
      }
      if (obj.ct2x) {
        delete newObj.ct2x;
        delete newObj.ct2y;
      }
      break;
    case 'L':
      if (obj.ctx) {
        delete newObj.ctx;
        delete newObj.cty;
      }
      if (obj.ct2x) {
        delete newObj.ct2x;
        delete newObj.ct2y;
      }
      break;
    default:
      break;
  }
  console.dir(newObj);
  return newObj;
  // Todo: We are mutating the 'obj' object. We need to rewrite it, so that it return a new object.
}

function insertMicro(list, index) {
  console.log("insertMicro");
  const obj = list[index];
  const newObj = {
    type: 'L',
    x: obj.x + 30,
    y: obj.y + 30
  };
  //return list.insert(index, newObj);
  list.splice(index, 0, newObj);
  return list;
}

function deleteMicro(list, index) {
  if (index == 0) {
    return list;
  }
  list.splice(index, 1);
  return list;
}

function modifyItem(list, index, type) {
  console.log("modifyItem");
  switch (type) {
    case 'C':
    case 'Q':
    case 'L':
      if (index != 0) {
        let newObj = changeType( list[index - 1], list[index], type);
        list[index] = newObj;
      }
      return list;
    case 'Insert':
      return insertMicro(list, index);
    case 'Delete':
      return deleteMicro(list, index);
    default :
      return list;
  }
}

export default { modifyItem };
