package com.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Date;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

import com.utils.ValidatorUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.baomidou.mybatisplus.mapper.Wrapper;
import com.annotation.IgnoreAuth;

import com.entity.OrdersEntity;
import com.entity.ShangpinxinxiEntity;
import com.entity.YonghuEntity;
import com.entity.view.OrdersView;

import com.service.OrdersService;
import com.service.ShangpinxinxiService;
import com.service.YonghuService;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MD5Util;
import com.utils.MPUtil;
import com.utils.CommonUtil;
import java.io.IOException;


/**
 * 订单
 * 后端接口
 * @author 
 * @email 
 * @date 2022-03-16 23:51:29
 */
@RestController
@RequestMapping("/orders")
public class OrdersController {
    @Autowired
    private OrdersService ordersService;
    @Autowired
    private YonghuService yonghuService;
    @Autowired
    private ShangpinxinxiService shangpinxinxiService;


    


    /**
     * 后端列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,OrdersEntity orders, 
		HttpServletRequest request){
    	if(!request.getSession().getAttribute("role").toString().equals("管理员")) {
    		orders.setUserid((Long)request.getSession().getAttribute("userId"));
    	}
        EntityWrapper<OrdersEntity> ew = new EntityWrapper<OrdersEntity>();
		PageUtils page = ordersService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, orders), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前端列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,OrdersEntity orders, 
		HttpServletRequest request){
        EntityWrapper<OrdersEntity> ew = new EntityWrapper<OrdersEntity>();
		PageUtils page = ordersService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, orders), params), params));
        return R.ok().put("data", page);
    }

	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( OrdersEntity orders){
       	EntityWrapper<OrdersEntity> ew = new EntityWrapper<OrdersEntity>();
      	ew.allEq(MPUtil.allEQMapPre( orders, "orders")); 
        return R.ok().put("data", ordersService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(OrdersEntity orders){
        EntityWrapper< OrdersEntity> ew = new EntityWrapper< OrdersEntity>();
 		ew.allEq(MPUtil.allEQMapPre( orders, "orders")); 
		OrdersView ordersView =  ordersService.selectView(ew);
		return R.ok("查询订单成功").put("data", ordersView);
    }
	
    /**
     * 后端详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        OrdersEntity orders = ordersService.selectById(id);
        return R.ok().put("data", orders);
    }

    /**
     * 前端详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        OrdersEntity orders = ordersService.selectById(id);
        return R.ok().put("data", orders);
    }
    



    /**
     * 后端保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody OrdersEntity orders, HttpServletRequest request){
    	orders.setId(new Date().getTime()+new Double(Math.floor(Math.random()*1000)).longValue());
    	//ValidatorUtils.validateEntity(orders);
    	orders.setUserid((Long)request.getSession().getAttribute("userId"));
        R check = processBalanceForPaidOrder(orders, request);
        if(check != null) {
            return check;
        }
        ordersService.insert(orders);
        return R.ok();
    }
    
    /**
     * 前端保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody OrdersEntity orders, HttpServletRequest request){
    	orders.setId(new Date().getTime()+new Double(Math.floor(Math.random()*1000)).longValue());
    	//ValidatorUtils.validateEntity(orders);
        R check = processBalanceForPaidOrder(orders, request);
        if(check != null) {
            return check;
        }
        ordersService.insert(orders);
        return R.ok();
    }

    private R processBalanceForPaidOrder(OrdersEntity orders, HttpServletRequest request) {
        if(!isPaidOrder(orders)) {
            return null;
        }
        if(orders.getUserid() == null && request.getSession().getAttribute("userId") != null) {
            orders.setUserid((Long) request.getSession().getAttribute("userId"));
        }
        if(orders.getUserid() == null) {
            return R.error("\u7528\u6237\u672a\u767b\u5f55\uff0c\u65e0\u6cd5\u652f\u4ed8");
        }

        YonghuEntity user = yonghuService.selectById(orders.getUserid());
        if(user == null) {
            return R.error("\u7528\u6237\u4e0d\u5b58\u5728\uff0c\u65e0\u6cd5\u652f\u4ed8");
        }

        int buyNumber = orders.getBuynumber() == null ? 1 : Math.max(1, orders.getBuynumber());
        ShangpinxinxiEntity product = null;
        if(orders.getGoodid() != null) {
            product = shangpinxinxiService.selectById(orders.getGoodid());
            if(product == null) {
                return R.error("\u5546\u54c1\u4e0d\u5b58\u5728\uff0c\u65e0\u6cd5\u652f\u4ed8");
            }
            int stock = product.getAlllimittimes() == null ? 0 : product.getAlllimittimes();
            if(stock <= 0) {
                return R.error("\u5e93\u5b58\u4e0d\u8db3\uff0c\u5f53\u524d\u5546\u54c1\u5df2\u552e\u7f44");
            }
            if(stock < buyNumber) {
                return R.error("\u5e93\u5b58\u4e0d\u8db3\uff0c\u5f53\u524d\u5e93\u5b58\uff1a" + stock + "\uff0c\u8d2d\u4e70\u6570\u91cf\uff1a" + buyNumber);
            }
        }

        float balance = user.getMoney() == null ? 0f : user.getMoney();
        float payable = getPayableAmount(orders);
        if(balance <= 0f) {
            return R.error("\u4f59\u989d\u4e0d\u8db3\uff0c\u8bf7\u5148\u5145\u503c\u540e\u518d\u652f\u4ed8");
        }
        if(balance < payable) {
            return R.error("\u4f59\u989d\u4e0d\u8db3\uff0c\u5f53\u524d\u4f59\u989d\uff1a" + balance + "\uff0c\u5e94\u652f\u4ed8\uff1a" + payable);
        }

        user.setMoney(balance - payable);
        yonghuService.updateById(user);
        if(product != null) {
            int stock = product.getAlllimittimes() == null ? 0 : product.getAlllimittimes();
            product.setAlllimittimes(stock - buyNumber);
            shangpinxinxiService.updateById(product);
        }
        return null;
    }

    private boolean isPaidOrder(OrdersEntity orders) {
        String status = orders.getStatus();
        return "\u5df2\u652f\u4ed8".equals(status) || (status != null && status.contains("\u652f\u4ed8")) || Integer.valueOf(1).equals(orders.getType());
    }

    private float getPayableAmount(OrdersEntity orders) {
        if(orders.getDiscounttotal() != null) return orders.getDiscounttotal();
        if(orders.getTotal() != null) return orders.getTotal();
        if(orders.getDiscountprice() != null && orders.getBuynumber() != null) return orders.getDiscountprice() * orders.getBuynumber();
        if(orders.getPrice() != null && orders.getBuynumber() != null) return orders.getPrice() * orders.getBuynumber();
        return 0f;
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    public R update(@RequestBody OrdersEntity orders, HttpServletRequest request){
        //ValidatorUtils.validateEntity(orders);
        ordersService.updateById(orders);//全部更新
        return R.ok();
    }
    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        ordersService.deleteBatchIds(Arrays.asList(ids));
        return R.ok();
    }
    
    /**
     * 提醒接口
     */
	@RequestMapping("/remind/{columnName}/{type}")
	public R remindCount(@PathVariable("columnName") String columnName, HttpServletRequest request, 
						 @PathVariable("type") String type,@RequestParam Map<String, Object> map) {
		map.put("column", columnName);
		map.put("type", type);
		
		if(type.equals("2")) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Calendar c = Calendar.getInstance();
			Date remindStartDate = null;
			Date remindEndDate = null;
			if(map.get("remindstart")!=null) {
				Integer remindStart = Integer.parseInt(map.get("remindstart").toString());
				c.setTime(new Date()); 
				c.add(Calendar.DAY_OF_MONTH,remindStart);
				remindStartDate = c.getTime();
				map.put("remindstart", sdf.format(remindStartDate));
			}
			if(map.get("remindend")!=null) {
				Integer remindEnd = Integer.parseInt(map.get("remindend").toString());
				c.setTime(new Date());
				c.add(Calendar.DAY_OF_MONTH,remindEnd);
				remindEndDate = c.getTime();
				map.put("remindend", sdf.format(remindEndDate));
			}
		}
		
		Wrapper<OrdersEntity> wrapper = new EntityWrapper<OrdersEntity>();
		if(map.get("remindstart")!=null) {
			wrapper.ge(columnName, map.get("remindstart"));
		}
		if(map.get("remindend")!=null) {
			wrapper.le(columnName, map.get("remindend"));
		}
		if(!request.getSession().getAttribute("role").toString().equals("管理员")) {
    		wrapper.eq("userid", (Long)request.getSession().getAttribute("userId"));
    	}


		int count = ordersService.selectCount(wrapper);
		return R.ok().put("count", count);
	}
	





    /**
     * （按值统计）
     */
    @RequestMapping("/value/{xColumnName}/{yColumnName}")
    public R value(@PathVariable("yColumnName") String yColumnName, @PathVariable("xColumnName") String xColumnName,HttpServletRequest request) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("xColumn", xColumnName);
        params.put("yColumn", yColumnName);
        EntityWrapper<OrdersEntity> ew = new EntityWrapper<OrdersEntity>();
            ew.in("status", new String[]{"已支付","已发货","已完成"});
        List<Map<String, Object>> result = ordersService.selectValue(params, ew);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        for(Map<String, Object> m : result) {
            for(String k : m.keySet()) {
                if(m.get(k) instanceof Date) {
                    m.put(k, sdf.format((Date)m.get(k)));
                }
            }
        }
        return R.ok().put("data", result);
    }

    /**
     * （按值统计）时间统计类型
     */
    @RequestMapping("/value/{xColumnName}/{yColumnName}/{timeStatType}")
    public R valueDay(@PathVariable("yColumnName") String yColumnName, @PathVariable("xColumnName") String xColumnName, @PathVariable("timeStatType") String timeStatType,HttpServletRequest request) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("xColumn", xColumnName);
        params.put("yColumn", yColumnName);
        params.put("timeStatType", timeStatType);
        EntityWrapper<OrdersEntity> ew = new EntityWrapper<OrdersEntity>();
            ew.in("status", new String[]{"已支付","已发货","已完成"});
        List<Map<String, Object>> result = ordersService.selectTimeStatValue(params, ew);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        for(Map<String, Object> m : result) {
            for(String k : m.keySet()) {
                if(m.get(k) instanceof Date) {
                    m.put(k, sdf.format((Date)m.get(k)));
                }
            }
        }
        return R.ok().put("data", result);
    }

    /**
     * 分组统计
     */
    @RequestMapping("/group/{columnName}")
    public R group(@PathVariable("columnName") String columnName,HttpServletRequest request) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("column", columnName);
        EntityWrapper<OrdersEntity> ew = new EntityWrapper<OrdersEntity>();
            ew.in("status", new String[]{"已支付","已发货","已完成"});
        List<Map<String, Object>> result = ordersService.selectGroup(params, ew);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        for(Map<String, Object> m : result) {
            for(String k : m.keySet()) {
                if(m.get(k) instanceof Date) {
                    m.put(k, sdf.format((Date)m.get(k)));
                }
            }
        }
        return R.ok().put("data", result);
    }
}
