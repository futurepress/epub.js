root=Dir.pwd
puts ">>> Serving: #{root}"
run Rack::Directory.new("#{root}")