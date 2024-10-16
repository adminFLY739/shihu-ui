
export function promotionsStatusRender(h, params) {
  let text = "未知",
    color = "red";
  if (params.row.promotionStatus === "NEW") {
    text = "未开始";
    color = "geekblue";
  } else if (params.row.promotionStatus === "START") {
    text = "已开始";
    color = "green";
  } else if (params.row.promotionStatus === "END") {
    text = "已结束";
    color = "red";
  } else if (params.row.promotionStatus === "CLOSE") {
    text = "已关闭";
    color = "red";
  }
  return h("div", [
    h(
      "Tag",
      {
        props: {
          color: color,
        },
      },
      text
    ),
  ]);
}

export function deliveryStatusRender(h, params) {
  let text = "未知",
    color = "red";
  if (params.row.deliveryStatus === "NOTISSUED") {
    text = "未领取";
    color = "geekblue";
  } else if (params.row.deliveryStatus === "NOTUSE") {
    text = "未使用";
    color = "green";
  } else if (params.row.deliveryStatus === "RECEIVED") {
    text = "已使用";
    color = "red";
  } else if (params.row.deliveryStatus === "CLOSED") {
    text = "已关闭";
    color = "red";
  }
  else if (params.row.deliveryStatus === "OVERDUE") {
    text = "已过期";
    color = "red";
  }
  return h("div", [
    h(
      "Tag",
      {
        props: {
          color: color,
        },
      },
      text
    ),
  ]);
}

export function promotionsScopeTypeRender(h, params) {
  let text = "未知",
    color = "red";
  if (params.row.scopeType == "ALL") {
    text = "全品类";
    color = "default";
  } else if (params.row.scopeType == "PORTION_GOODS_CATEGORY") {
    text = "商品分类";
    color = "yellow";
  } else if (params.row.scopeType == "PORTION_SHOP_CATEGORY") {
    text = "店铺分类";
    color = "pink";
  } else if (params.row.scopeType == "PORTION_GOODS") {
    text = "指定商品";
    color = "magenta";
  }
  return h("div", [
    h(
      "Tag",
      {
        props: {
          color: color,
        },
      },
      text
    ),
  ]);
}

export function memberPromotionsStatusRender(h, status) {
  let text = "未知",
    color = "red";
  if (status == "NEW") {
    text = "已领取";
    color = "geekblue";
  } else if (status == "USED") {
    text = "已使用";
    color = "green";
  } else if (status == "EXPIRE") {
    text = "已过期";
    color = "red";
  } else if (status == "CLOSED") {
    text = "已作废";
    color = "red";
  }
  return h("div", [
    h(
      "Tag",
      {
        props: {
          color: color,
        },
      },
      text
    ),
  ]);
}
