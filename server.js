/*global require,process */
var express=require('express'),
	app=express(),
	bodyParser=require('body-parser'),
	morgan=require('morgan'),
	mongoose=require('mongoose'),
	port=process.env.PORT||3000,
	apiRouter=express.Router(),
	User=require('./models/user'),
	jwt=require('jsonwebtoken'),
	superSecret='nthg00nach@ng3myl0v!S#it';
mongoose.connect('mongodb://localhost:27017/node-api');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/api',apiRouter);
app.use(function(req,res,next){
	res.setHeader('Access-Control-Allow-Origin','*');
	res.setHeader('Access-Control-Allow-Methods','GET,POST');
	res.setHeader('Access-Control-Allow-Headers','X-Requested-With,content-type,\Authorization');
	next();
});

app.use(morgan('dev'));

app.get('/',function(req,res){
	res.send('Hairat');
});

apiRouter.post('/authenticate',function(req,res){
	User.findOne({
		username:req.body.username
	}).select('name username password').exec(function(err,user){
		if(err) return err;
		if(!user){
			res.json({
				success:false,
				message:'Authentication failed. User not found.'
			});
		}else if(user){
			var validPassword=user.comparePassword(req.body.password);
			if(!validPassword){
				res.json({
					success:false,
					message:'Authentication failed. Wrong Password.'
				});
			}else{
				var token=jwt.sign({
					name:user.name,
					username:user.username
				},superSecret,{expiresIn:1440});
				
				res.json({
					success:true,
					message:'Enjoy your token!',
					token:token
				})
			}
		}
	});
});

apiRouter.use(function(req,res,next){
	console.log('___attack__________');
	next();
});
apiRouter.get('/',function(req,res){
	res.json({message:"sth going on here"});
});
apiRouter.route('/users')
	.post(function(req,res){
		var user=new User();
		user.name=req.body.name;
		user.username=req.body.username;
		user.password=req.body.password;
		user.save(function(err){
			if(err){
				if(err.code==11000){
					return res.json({success:false,message:'user with that username already exists.'});
				}
				else{
					return res.send(err);
				}
			}
			res.json({message:'User created!'});
		});
	})
	.get(function(req,res){
		User.find(function(err,users){
			if(err){ res.send(err);}
			res.json(users);
		});
	});

apiRouter.route('/users/:user_id')
	.get(function(req,res){
		User.findById(req.params.user_id,function(err,user){
			if(err) res.send(err);
			res.json(user);
		});
	})
	.put(function(req,res){
		console.log('--- put user ---');
		User.findById(req.params.user_id,function(err,user){
			if(err) res.send(err);
			if(req.body.name)user.name=req.body.name;
			if(req.body.username)user.username=req.body.username;
			if(req.body.password)user.password=req.body.password;
			
			user.save(function(err){
				if(err) res.send(err);
				res.json({message:"User updated!!!!"});
			});
		});
	})
	.delete(function(req,res){
		User.remove({_id:req.params.user_id},function(err,user){
			if(err) return res.send(err);
			res.json({message:'Successfully deleted'});
		});
	});

app.listen(port);
console.log('sth going on '+port);